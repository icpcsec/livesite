import argparse
import json
import logging
import sys

from livecli import clients


def upload_main(options: argparse.Namespace) -> None:
    client = clients.create_client(options)

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

    if isinstance(data, dict) and 'ts' in data:
        logging.warning(
            'Given JSON file is in legacy format. Converting automatically.')
        data = data['data']

    client.set_feeds({options.feed: data})

    logging.info('OK.')
