import argparse
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
    problems, standings = scraper.scrape(html)
    print('problems:')
    json.dump(problems, sys.stdout, separators=(',', ':'))
    print()
    print()
    print('standings:')
    json.dump(standings, sys.stdout, separators=(',', ':'))
    print()


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

    logging.debug('Getting the initial feeds...')
    init_feeds = client.get_feeds()
    last_problems = init_feeds[types.FeedType.CONTEST]['problems']
    last_standings = init_feeds[types.FeedType.STANDINGS]

    logging.info('OK.')

    while True:
        _wait_next_tick(options.interval_seconds)
        try:
            timestamp = int(time.time())
            r = requests.get(scoreboard_url, timeout=(options.interval_seconds * 0.9))
            with open(os.path.join(log_dir, 'standings.%d.html' % timestamp), 'wb') as f:
                f.write(r.content)
            r.raise_for_status()
            html = r.text
            problems, standings = scraper.scrape(html)
            with open(os.path.join(log_dir, 'standings.%d.json' % timestamp), 'w') as f:
                json.dump(standings, f, separators=(',', ':'))
            updates = {}
            if problems is not None and problems != last_problems:
                logging.warning('Problems changed. Updating contest...')
                contest = client.get_feeds()[types.FeedType.CONTEST]
                contest['problems'] = problems
                updates[types.FeedType.CONTEST] = contest
                last_problems = problems
            if standings is not None and standings != last_standings:
                updates[types.FeedType.STANDINGS] = standings
                last_standings = standings
            if updates:
                logging.info('Updating the feeds...')
                client.set_feeds(updates)
                logging.info('Success.')
            else:
                logging.info('No update.')
        except Exception:
            logging.exception('Unhandled exception')
