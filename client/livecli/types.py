import enum
import json
import logging
import os
import sys
import typing


class FeedType(enum.Enum):
    CONTEST = 'contest'
    TEAMS = 'teams'
    STANDINGS = 'standings'

    def __str__(self) -> str:
        return self.value


class Config(typing.NamedTuple):
    project: str
    gs_url_prefix: str
    user_info: dict

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
            project=raw_dict['project'],
            gs_url_prefix=raw_dict['gs_url_prefix'],
            user_info=raw_dict['user_info'])

    def save(self, path: str) -> None:
        try:
            with open(path, 'r') as f:
                raw_dict = json.load(f)
        except (OSError, ValueError):
            raw_dict = {}
        raw_dict.update({
            'project': self.project,
            'gs_url_prefix': self.gs_url_prefix,
            'user_info': self.user_info,
        })
        with open(path, 'w') as f:
            os.fchmod(f.fileno(), 0o600)
            json.dump(raw_dict, f, indent=2, sort_keys=True)