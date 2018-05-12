import logging
import gzip
import io
import json
import time
from typing import Any, BinaryIO, Dict, Generator, List, Optional
import urllib.parse

from google.api_core import exceptions as google_api_exceptions
from google.oauth2 import credentials as google_credentials
from google.auth.transport import requests as google_auth_requests
from google.cloud.storage import client as storage_client
import requests

from livecli import constants
from livecli import types


class _BytesListWriter:
    def __init__(self, buffer: List[bytes]):
        self._buffer = buffer

    def write(self, data: bytes) -> None:
        self._buffer.append(data)


class _GzipEncoder:
    def __init__(self, fileobj: BinaryIO):
        self._iterator = iter(self._gzip_stream(fileobj))
        self._read_buffer = b''

    def read(self, size: Optional[int] = None) -> bytes:
        if size is None or size < 0:
            size = 1 << 64
        data = b''
        while len(data) < size:
            while not self._read_buffer:
                try:
                    self._read_buffer += next(self._iterator)
                except StopIteration:
                    break
            if not self._read_buffer:
                break
            take_size = min(size - len(data), len(self._read_buffer))
            data += self._read_buffer[:take_size]
            self._read_buffer = self._read_buffer[take_size:]
        return data

    @staticmethod
    def _gzip_stream(fileobj: BinaryIO) -> Generator[bytes, None, None]:
        out_buffer = []
        with gzip.GzipFile(fileobj=_BytesListWriter(out_buffer), mode='wb') as gzip_file:
            while True:
                plain_data = fileobj.read(4096)
                if not plain_data:
                    break
                gzip_file.write(plain_data)
                for gzip_data in out_buffer:
                    yield gzip_data
                del out_buffer[:]
        # GzipFile.close() may write trailers.
        for gzip_data in out_buffer:
            yield gzip_data
        del out_buffer[:]


def _get_gs_public_url(gs_url: str) -> str:
    parsed_gs_url = urllib.parse.urlparse(gs_url)
    return 'https://storage.googleapis.com/%s%s' % (parsed_gs_url.netloc,
                                                    parsed_gs_url.path)


class LiveClient:
    def __init__(self, config: types.Config):
        self._config = config
        self._session = google_auth_requests.AuthorizedSession(
            google_credentials.Credentials.from_authorized_user_info(
                config.user_info, scopes=constants.SCOPES))
        self._storage = storage_client.Client(project=config.project, _http=self._session)

    def get_email(self) -> Optional[str]:
        r = self._session.get('https://www.googleapis.com/oauth2/v1/userinfo?alt=json')
        try:
            r.raise_for_status()
        except requests.HTTPError:
            logging.exception('Could not get user email. Is the permission revoked?')
            return None
        return r.json()['email']

    def verify_database_permission(self) -> bool:
        r = self._session.get('https://%s.firebaseio.com/.json' % self._config.project)
        try:
            r.raise_for_status()
        except requests.HTTPError:
            logging.exception(
                'Could not verify Firebase admin access. '
                'Do you have Editor access to GCP project %s?',
                self._config.project)
            return False
        logging.info('Verified Firebase admin access.')
        return True

    def verify_storage_permission(self) -> bool:
        gs_bucket = urllib.parse.urlparse(self._config.gs_url_prefix).netloc
        bucket = self._storage.bucket(gs_bucket)
        try:
            bucket.reload()
            bucket.blob('.verify-credentials-test').upload_from_string(b'test')
        except google_api_exceptions.ClientError:
            logging.exception('Could not verify Google Cloud Storage access.')
            return False
        logging.info('Verified Google Cloud Storage access.')
        return True

    def _upload_json_to_gs(self, gs_url: str, data: Any) -> None:
        binary_buffer = io.BytesIO()
        with gzip.GzipFile(fileobj=binary_buffer, mode='wb') as gzip_stream:
            with io.TextIOWrapper(gzip_stream, encoding='utf-8') as text_stream:
                json.dump(data, text_stream, sort_keys=True)
        binary_buffer.seek(0)

        parsed_gs_url = urllib.parse.urlparse(gs_url)
        if parsed_gs_url.scheme != 'gs':
            raise ValueError('Invalid scheme')
        bucket = self._storage.bucket(parsed_gs_url.netloc)
        blob = bucket.blob(parsed_gs_url.path.lstrip('/'))
        blob.cache_control = constants.BLOB_CACHE_CONTROL
        blob.content_encoding = 'gzip'
        blob.upload_from_file(binary_buffer, content_type='application/json')

    def _update_database(self, instance: str, feed_urls: Dict[types.FeedType, str]) -> None:
        for feed_type, public_url in feed_urls.items():
            db_url = 'https://%s.firebaseio.com/%s/feeds/%s.json' % (
                self._config.project, instance, feed_type)
            r = self._session.put(db_url, json=public_url)
            r.raise_for_status()

    def set_feeds(self, instance: str, feeds: Dict[types.FeedType, Any]) -> None:
        public_urls = {}
        for feed_type, data in feeds.items():
            gs_url = '%s/%s/%s.%d.json' % (
                self._config.gs_url_prefix.rstrip('/'), instance, feed_type,
                int(time.time() * 1000))

            logging.info('Uploading to %s', gs_url)
            self._upload_json_to_gs(gs_url, data)
            public_urls[feed_type] = _get_gs_public_url(gs_url)

        logging.info('Updating Firebase realtime database')
        self._update_database(instance, public_urls)

    def get_feeds(self, instance: str) -> Dict[types.FeedType, Any]:
        feeds_url = 'https://%s.firebaseio.com/%s/feeds.json' % (
                self._config.project, instance)
        r = self._session.get(feeds_url)
        r.raise_for_status()
        result = r.json()
        if not result:
            raise ValueError('Instance %s is uninitialized' % instance)
        feeds = {}
        for feed_type in types.FeedType:
            url = result.get(str(feed_type))
            if not url:
                raise ValueError('Instance %s is missing feed %s' % (instance, feed_type))
            else:
                r = self._session.get(url)
                r.raise_for_status()
                data = r.json()
            feeds[feed_type] = data
        return feeds
