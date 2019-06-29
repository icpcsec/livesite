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

import enum
import json
import logging
import os
import sys


class FeedType(enum.Enum):
    CONTEST = 'contest'
    TEAMS = 'teams'
    STANDINGS = 'standings'

    def __str__(self) -> str:
        return self.value


class Config:
    def __init__(self, gs_url_prefix, user_info):
        self.gs_url_prefix = gs_url_prefix
        self.user_info = user_info

    @classmethod
    def load(cls, path: str) -> 'Config':
        try:
            with open(path, 'r') as f:
                raw_dict = json.load(f)
        except OSError:
            logging.error('Failed to open the config file at %s.', path)
            logging.error('Please set up with:')
            logging.error('  livecli.py setup')
            sys.exit(1)
        return cls(
            gs_url_prefix=raw_dict['gs_url_prefix'],
            user_info=raw_dict['user_info'])

    def save(self, path: str) -> None:
        try:
            with open(path, 'r') as f:
                raw_dict = json.load(f)
        except (OSError, ValueError):
            raw_dict = {}
        raw_dict.update({
            'gs_url_prefix': self.gs_url_prefix,
            'user_info': self.user_info,
        })
        with open(path, 'w') as f:
            os.fchmod(f.fileno(), 0o600)
            json.dump(raw_dict, f, indent=2, sort_keys=True)
