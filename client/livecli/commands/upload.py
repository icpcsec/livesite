import argparse
import json
import logging
import sys

from livecli import clients
from livecli import types


def upload_main(options: argparse.Namespace) -> None:
    config = types.Config.load(options.config_path)
    feed_path = options.path[0]

    try:
        with open(feed_path, 'r') as f:
            data = json.load(f)
    except OSError:
        logging.error('File not found: %s', feed_path)
        sys.exit(1)
    except ValueError:
        logging.error('Not a valid JSON file: %s', feed_path)
        sys.exit(1)

    client = clients.LiveClient(config)

    client.set_feeds(options.instance, {options.feed: data})

    logging.info('OK.')
