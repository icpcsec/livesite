import argparse
import json
import logging
import sys
from typing import Optional

from livecli import clients
from livecli import types


def _detect_feed_type(data: dict) -> Optional[types.FeedType]:
    if 'times' in data:
        return types.FeedType.CONTEST
    if 'entries' in data:
        return types.FeedType.STANDINGS
    if data and 'university' in next(iter(data.values())):
        return types.FeedType.TEAMS
    return None


def upload_main(options: argparse.Namespace) -> None:
    client = clients.create_client(options)

    feeds = {}

    for feed_path in options.paths:
        try:
            with open(feed_path, 'r') as f:
                data = json.load(f)
        except OSError:
            logging.error('File not found: %s', feed_path)
            sys.exit(1)
        except ValueError:
            logging.error('Not a valid JSON file: %s', feed_path)
            sys.exit(1)

        if isinstance(data, dict) and 'ts' in data:
            data = data['data']

        feed_type = _detect_feed_type(data)
        if not feed_type:
            logging.error('Can not detect the feed type: %s', feed_path)
            sys.exit(1)

        feeds[feed_type] = data

    client.set_feeds(feeds)

    logging.info('OK.')
