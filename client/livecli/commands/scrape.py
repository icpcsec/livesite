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


def _scrape_test(scraper: base.Scraper, local_file_path: str) -> None:
    with open(local_file_path, 'r') as f:
        html = f.read()
    standings = scraper.scrape(html)
    json.dump(standings, sys.stdout, indent=2, sort_keys=True)


def _wait_next_tick(interval_seconds: int) -> None:
    now = time.time()
    next_tick = math.ceil(now / interval_seconds) * interval_seconds
    time.sleep(next_tick - now)


def scrape_main(options: argparse.Namespace) -> None:
    scraper = options.scraper_class(options)

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

    logging.info('Attempting an initial scrape...')
    r = session.get(scoreboard_url, timeout=(options.interval_seconds * 0.9))
    r.raise_for_status()
    try:
        try:
            scraper.scrape(r.text)
        except base.NeedLoginException:
            logging.info('Logging in...')
            scraper.login(session)
            logging.info('Attempting an initial scrape after login...')
            r = session.get(scoreboard_url, timeout=(options.interval_seconds * 0.9))
            r.raise_for_status()
            scraper.scrape(r.text)
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
            logging.info('Scraping...')
            timestamp = int(time.time())
            r = session.get(scoreboard_url, timeout=(options.interval_seconds * 0.9))
            with open(os.path.join(log_dir, 'standings.%d.html' % timestamp), 'wb') as f:
                f.write(r.content)
            r.raise_for_status()
            try:
                standings = scraper.scrape(r.text)
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
