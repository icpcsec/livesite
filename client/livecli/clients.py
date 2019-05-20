# Copyright 2019 LiveSite authors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import abc
import argparse
import logging
import gzip
import io
import json
import os
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


def _get_gs_public_url(gs_url: str) -> str:
    parsed_gs_url = urllib.parse.urlparse(gs_url)
    return 'https://storage.googleapis.com/%s%s' % (parsed_gs_url.netloc,
                                                    parsed_gs_url.path)


class FirebaseClient:
    def __init__(self, session: requests.Session, origin: str):
        self._session = session
        self._origin = origin

    def set_feeds(self, feed_urls: Dict[types.FeedType, str]) -> None:
        logging.info('Updating Firebase realtime database')
        for feed_type, public_url in feed_urls.items():
            db_url = '%s/feeds/%s.json' % (self._origin, feed_type)
            r = self._session.put(db_url, json=public_url)
            r.raise_for_status()

    def get_feeds(self) -> Dict[types.FeedType, str]:
        feeds_url = '%s/feeds.json' % self._origin
        r = self._session.get(feeds_url)
        r.raise_for_status()
        result = r.json()
        if not result:
            raise ValueError('Instance is uninitialized')
        feed_urls = {}
        for feed_type in types.FeedType:
            url = result.get(str(feed_type))
            if not url:
                raise ValueError('Instance is missing feed %s' % feed_type)
            feed_urls[feed_type] = url
        return feed_urls


class Client(abc.ABC):
    @abc.abstractmethod
    def print_configs(self) -> None:
        ...

    @abc.abstractmethod
    def get_email(self) -> Optional[str]:
        ...

    @abc.abstractmethod
    def verify_database_permission(self) -> bool:
        ...

    @abc.abstractmethod
    def verify_storage_permission(self) -> bool:
        ...

    @abc.abstractmethod
    def set_feeds(self, feeds: Dict[types.FeedType, Any]) -> None:
        ...

    @abc.abstractmethod
    def get_feeds(self) -> Dict[types.FeedType, Any]:
        ...


class DevClient(Client):
    STATIC_URL = 'http://localhost:5000'
    FIREBASE_URL = 'http://localhost:5001'
    DEMODATA_DIR = os.path.join(os.path.dirname(__file__), '../../public/.dev')

    def __init__(self):
        self._session = requests.Session()

    def print_configs(self) -> None:
        logging.info('Using development client.')

    def get_email(self) -> Optional[str]:
        return 'dev@localhost'

    def verify_database_permission(self) -> bool:
        return True

    def verify_storage_permission(self) -> bool:
        return True

    def set_feeds(self, feeds: Dict[types.FeedType, Any]) -> None:
        try:
            os.mkdir(DevClient.DEMODATA_DIR)
        except FileExistsError:
            pass

        feed_urls = {}
        for feed_type, data in feeds.items():
            name = '%s.%.6f.json' % (feed_type, time.time())
            with open(os.path.join(DevClient.DEMODATA_DIR, name), 'w') as f:
                json.dump(data, f, indent=2, sort_keys=True)
            feed_urls[feed_type] = '/.dev/%s' % name

        client = FirebaseClient(self._session, DevClient.FIREBASE_URL)
        client.set_feeds(feed_urls)

    def get_feeds(self) -> Dict[types.FeedType, Any]:
        client = FirebaseClient(self._session, DevClient.FIREBASE_URL)
        feed_urls = client.get_feeds()
        feeds = {}
        for feed_type, feed_url in feed_urls.items():
            real_feed_url = urllib.parse.urljoin(DevClient.STATIC_URL, feed_url)
            r = self._session.get(real_feed_url)
            r.raise_for_status()
            feeds[feed_type] = r.json()
        return feeds


class ProdClient(Client):
    def __init__(self, project: str, config: types.Config):
        self._project = project
        self._config = config
        self._session = google_auth_requests.AuthorizedSession(
            google_credentials.Credentials.from_authorized_user_info(
                config.user_info, scopes=constants.SCOPES))
        self._storage = storage_client.Client(project=project, _http=self._session)

    def print_configs(self) -> None:
        logging.info('Using production client.')
        logging.info('  Project: %s', self._project)
        logging.info('  GCS URL: %s', self._config.gs_url_prefix)

    def get_email(self) -> Optional[str]:
        r = self._session.get('https://www.googleapis.com/oauth2/v1/userinfo?alt=json')
        try:
            r.raise_for_status()
        except requests.HTTPError:
            logging.exception('Could not get user email. Is the permission revoked?')
            return None
        return r.json()['email']

    def verify_database_permission(self) -> bool:
        r = self._session.get('https://%s.firebaseio.com/.json' % self._project)
        try:
            r.raise_for_status()
        except requests.HTTPError:
            logging.exception(
                'Could not verify Firebase admin access. '
                'Do you have Editor access to GCP project %s?',
                self._project)
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

    def _update_database(self, feed_urls: Dict[types.FeedType, str]) -> None:
        for feed_type, public_url in feed_urls.items():
            db_url = 'https://%s.firebaseio.com/feeds/%s.json' % (
                self._project, feed_type)
            r = self._session.put(db_url, json=public_url)
            r.raise_for_status()

    def set_feeds(self, feeds: Dict[types.FeedType, Any]) -> None:
        public_urls = {}
        for feed_type, data in feeds.items():
            gs_url = '%s/%s.%d.json' % (
                self._config.gs_url_prefix.rstrip('/'),
                feed_type,
                int(time.time() * 1000))

            logging.info('Uploading to %s', gs_url)
            self._upload_json_to_gs(gs_url, data)
            public_urls[feed_type] = _get_gs_public_url(gs_url)

        logging.info('Updating Firebase realtime database')
        self._update_database(public_urls)

    def get_feeds(self) -> Dict[types.FeedType, Any]:
        feeds_url = 'https://%s.firebaseio.com/feeds.json' % self._project
        r = self._session.get(feeds_url)
        r.raise_for_status()
        result = r.json()
        if not result:
            raise ValueError('Instance is uninitialized')
        feeds = {}
        for feed_type in types.FeedType:
            url = result.get(str(feed_type))
            if not url:
                raise ValueError('Instance is missing feed %s' % feed_type)
            else:
                r = self._session.get(url)
                r.raise_for_status()
                data = r.json()
            feeds[feed_type] = data
        return feeds


def create_client(options: argparse.Namespace) -> Client:
    if options.local:
        return DevClient()

    if not options.project:
        raise ValueError('--project or --local is required')
    config = types.Config.load(options.config_path)
    return ProdClient(options.project, config)
