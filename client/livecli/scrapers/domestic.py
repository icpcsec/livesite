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
import logging

import bs4
import requests

from livecli.scrapers import base

_TEAM_COLUMNS = ('rank', 'teamId', None, None, 'solved', 'penalty')

_PROBLEM_COLORS = (
    '#F44336',  # red
    '#4CAF50',  # green
    '#EAD61E',  # yellow
    '#3F51B5',  # blue
    '#F48FB1',  # pink
    '#FF9800',  # orange
    '#81D4FA',  # cyan
    '#E040FB',  # purple
    '#76FF03',  # light green
    '#FFFFFF',  # white
    '#000000',  # black
)


def _parse_problem_status(text: str) -> dict:
    if '(' in text:
        a, b = text.rstrip(')').split('(')
        text = a.strip()
        attempts = int(b)
    else:
        attempts = 0
    if text:
        attempts += 1
        penalty = int(text)
        solved = True
    else:
        penalty = 0
        solved = False
    return {
        'solved': solved,
        'attempts': attempts,
        'penalty': penalty,
        'pendings': 0,
    }


class DomesticScraper(base.Scraper):
    def __init__(self, options: argparse.Namespace):
        self._options = options

    def scrape_impl(self, html: str) -> dict:
        standings = {'problems': [], 'entries': []}
        if 'rehearsal' in html and not self._options.allow_rehearsal:
            logging.info('Contest has not started yet.')
            return standings

        doc = bs4.BeautifulSoup(html, 'html5lib')

        if doc.select('form[method="POST"] input[type="password"]'):
            raise base.NeedLoginException()

        mains = doc.select('.main')
        if not mains:
            return standings

        table = mains[-1].table
        if not table:
            return standings

        for tr in table.select('tr'):
            row = [td.get_text().strip() for td in tr.select('td')]

            if row[0] == 'rank':
                # Header row: scrape problems.
                for label, color in zip(row[6:], _PROBLEM_COLORS):
                    standings['problems'].append({
                        'label': label,
                        'name': 'Problem %s' % label,
                        'color': color,
                    })
                continue

            entry = dict(zip(_TEAM_COLUMNS, row))
            entry['solved'] = int(entry['solved'])
            entry['penalty'] = int(entry['penalty'])
            del entry[None]

            entry['problems'] = [_parse_problem_status(col) for col in row[6:]]
            standings['entries'].append(entry)

        return standings

    def login(self, session: requests.Session) -> None:
        r = session.get(self._options.login_url)
        r.raise_for_status()

        doc = bs4.BeautifulSoup(r.text, 'html5lib')

        params = {}
        params['team_id'] = self._options.login_user
        params['pass'] = self._options.login_password

        r = session.post(self._options.login_url, params)
        r.raise_for_status()

        doc = bs4.BeautifulSoup(r.text, 'html5lib')
        alerts = doc.select('font[color=red]')
        if alerts:
            raise Exception('Login failed: %s' % alerts[0].get_text())
