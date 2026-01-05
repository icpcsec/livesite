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

import argparse
import datetime
import json
import logging
import math
import os
import sys
import time

import requests

from livecli import clients
from livecli import types
from livecli.scrapers import base


def _extract_filename_from_url(url: str) -> str:
    """Extract filename from URL path.

    Args:
        url: URL to extract filename from

    Returns:
        Last path component (e.g., '/api/v4/contests/1/problems' -> 'problems')
    """
    from urllib.parse import urlparse
    path = urlparse(url).path
    # Get last non-empty component
    components = [c for c in path.split('/') if c]
    return components[-1] if components else 'resource'


def _load_test_resources(url_list: list[str]) -> dict[str, bytes]:
    """Load test resources from local files.

    Args:
        url_list: List of local file paths from scraper.get_urls()

    Returns:
        Dict mapping URL to bytes
    """
    resources = {}

    for url in url_list:
        # Try common extensions
        for ext in ['', '.json', '.html', '.txt']:
            filepath = f'{url}{ext}'
            if os.path.exists(filepath):
                with open(filepath, 'rb') as f:
                    resources[url] = f.read()
                break
        else:
            raise FileNotFoundError(f'File not found: {url} (tried extensions: .json, .html, .txt, and no extension)')

    return resources


def _scrape_test(scraper: base.Scraper, local_path: str) -> None:
    """Test scraper with local files."""
    url_list = scraper.get_urls(local_path)
    resources = _load_test_resources(url_list)
    standings = scraper.scrape(resources)
    json.dump(standings, sys.stdout, indent=2, sort_keys=True)


def _wait_next_tick(interval_seconds: int) -> None:
    now = time.time()
    next_tick = math.ceil(now / interval_seconds) * interval_seconds
    time.sleep(next_tick - now)


def _fetch_resources(session: requests.Session, url_list: list[str], timeout: float) -> dict[str, bytes]:
    """Fetch all resources from URLs.

    Args:
        session: requests.Session to use
        url_list: List of URLs to fetch
        timeout: Request timeout in seconds

    Returns:
        Dict mapping URL to response bytes
    """
    resources = {}
    for url in url_list:
        r = session.get(url, timeout=timeout)
        r.raise_for_status()
        resources[url] = r.content
    return resources


def _save_resources(resources: dict[str, bytes], log_dir: str, timestamp: int) -> None:
    """Save fetched resources to archive files.

    Args:
        resources: Dict mapping URL to bytes
        log_dir: Directory to save files
        timestamp: Unix timestamp for filenames
    """
    for url, content in resources.items():
        filename_base = _extract_filename_from_url(url)

        # Determine file extension from URL
        if '/api/' in url or 'json' in url.lower():
            ext = '.json'
        else:
            ext = '.html'

        filename = f'{filename_base}.{timestamp}{ext}'
        with open(os.path.join(log_dir, filename), 'wb') as f:
            f.write(content)


def scrape_main(options: argparse.Namespace) -> None:
    scraper: base.Scraper = options.scraper_class(options)

    if options.test_with_local_file:
        _scrape_test(scraper, options.test_with_local_file)
        return

    scoreboard_url = options.scoreboard_url
    if not scoreboard_url:
        print('error: --scoreboard-url is required', file=sys.stderr)
        sys.exit(1)

    log_dir = options.log_dir
    if not log_dir:
        print('error: --log-dir is required', file=sys.stderr)
        sys.exit(1)

    os.makedirs(log_dir, exist_ok=True)

    client = clients.create_client(options)
    client.print_configs()

    email = client.get_email()
    logging.info('Logged in as: %s', email)

    logging.info('Getting initial feeds...')
    init_feeds = client.get_feeds()
    last_standings = init_feeds[types.FeedType.STANDINGS]

    session = requests.Session()
    url_list = scraper.get_urls(scoreboard_url)

    # Pre-configure authentication if credentials are available
    if scraper.has_credentials():
        logging.info('Credentials provided, configuring authentication...')
        scraper.login(session)

    logging.info('Attempting an initial scrape...')
    try:
        resources = _fetch_resources(session, url_list, options.interval_seconds * 0.9)
        scraper.scrape(resources)
    except Exception:
        logging.exception('Unhandled exception')
    else:
        logging.info('Ready.')

    while True:
        upload = False
        try:
            feeds = client.get_feeds()
            contest = feeds[types.FeedType.CONTEST]
            contest_start_time = datetime.datetime.fromtimestamp(
                contest['times']['start'])
            contest_end_time = datetime.datetime.fromtimestamp(
                contest['times']['end'])
        except Exception:
            logging.exception('Unhandled exception')
        else:
            now = datetime.datetime.now()
            upload_start_time = contest_start_time - datetime.timedelta(
                minutes=options.pre_contest_minutes)
            upload_end_time = contest_end_time + datetime.timedelta(
                minutes=options.post_contest_minutes)
            upload = upload_start_time <= now <= upload_end_time

        _wait_next_tick(options.interval_seconds)

        try:
            logging.info('Scraping...%s' % ('' if options.upload and upload else ' (dry-run)'))
            timestamp = int(time.time())
            resources = _fetch_resources(session, url_list, options.interval_seconds * 0.9)
            _save_resources(resources, log_dir, timestamp)

            try:
                standings = scraper.scrape(resources)
            except base.NeedLoginException:
                logging.info('Logging in...')
                scraper.login(session)
                logging.info('Login success')
                continue

            with open(os.path.join(log_dir, 'standings.%d.json' % timestamp), 'w') as f:
                json.dump(standings, f, separators=(',', ':'), sort_keys=True)

            if standings is not None and standings != last_standings:
                if not options.upload:
                    logging.warning('Not uploading because of --no-upload flag')
                    continue
                if not upload:
                    logging.warning('Not uploading because it is out of contest time')
                    continue
                logging.info('Updating feeds...')
                client.set_feeds({types.FeedType.STANDINGS: standings})
                last_standings = standings
            else:
                logging.info('No update')
        except Exception:
            logging.exception('Unhandled exception')
