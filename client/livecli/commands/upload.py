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
from datetime import datetime
import logging
import sys
from typing import Optional

import yaml

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
                data = yaml.safe_load(f)
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

        if feed_type == types.FeedType.CONTEST:
            for time_key in ['start', 'freeze', 'end']:
                time = data['times'][time_key]
                if isinstance(time, str):
                    timestamp = datetime.fromisoformat(time).timestamp()
                    data['times'][time_key] = int(timestamp)

        feeds[feed_type] = data

    client.set_feeds(feeds)

    logging.info('OK.')
