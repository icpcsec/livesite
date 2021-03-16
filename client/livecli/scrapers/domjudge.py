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
import re

import bs4
import requests

from livecli.scrapers import base

_DEFAULT_COLORS = (
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

_LABEL_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'


class DomjudgeScraper(base.Scraper):
    def __init__(self, options: argparse.Namespace):
        self._options = options

    def scrape_impl(self, html: str) -> dict:
        doc = bs4.BeautifulSoup(html, 'html5lib')

        if doc.select('#loginform'):
            raise base.NeedLoginException()

        standings = {'problems': [], 'entries': []}

        scoreheader_elems = doc.select('.scoreheader')
        if not scoreheader_elems:
            raise Exception('Scoreboard not available yet')
        scoreheader_elem = scoreheader_elems[0]
        for index_problem, problem_elem in enumerate(scoreheader_elem.select('th')[3:]):
            # label = problem_elem.get_text().strip()
            label = _LABEL_CHARS[index_problem % len(_LABEL_CHARS)]
            tooltip = problem_elem.attrs.get('title', '')
            if tooltip.startswith('problem '):
                name = tooltip[len('problem '):].strip(' \'')
            else:
                name = ''
            circles = problem_elem.select('.circle')
            if circles:
                style = circles[0].attrs.get('style', '')
                m = re.search(r'background:\s*([^\s;]+)\s*;', style)
                color = m.group(1) if m else ''
            else:
                color = _DEFAULT_COLORS[index_problem % len(_DEFAULT_COLORS)]
            standings['problems'].append({
                'label': label,
                'name': name,
                'color': color,
            })

        scoreboard_elem = doc.select('table.scoreboard')[0]
        last_rank = 1
        for team_elem in scoreboard_elem.select('tbody tr'):
            if not team_elem.attrs.get('id', '').startswith('team:'):
                break
            team_problems = []
            for problem_elem in team_elem.select('td.score_cell'):
                text = problem_elem.get_text().strip()
                if not text:
                    penalty, attempts, pendings = 0, 0, 0
                else:
                    m = re.search(r'^(?:(?P<penalty>\d+)\s+)?(?P<attempts>\d+)\s+(?:\+\s+(?P<pendings>\d+)\s+)?(?:try|tries)$', text)
                    assert m, text
                    penalty = int(m.group('penalty') or '0')
                    attempts = int(m.group('attempts'))
                    pendings = int(m.group('pendings') or '0')
                classes = problem_elem['class']
                solved = len(problem_elem.select('.score_correct')) > 0
                team_problems.append({
                    'attempts': attempts,
                    'pendings': pendings,
                    'penalty': penalty,
                    'solved': solved,
                })
            rank = team_elem.select('.scorepl')[0].get_text().strip()
            if rank:
                last_rank = rank = int(rank)
            else:
                rank = last_rank
            name = team_elem.select('.scoretn .forceWidth')[0].get_text().strip()
            try:
                tid = str(int(name.split(':', 1)[0], 10))
            except ValueError:
                continue
            solved = int(team_elem.select('.scorenc')[0].get_text().strip())
            penalty = int(team_elem.select('.scorett')[0].get_text().strip())
            standings['entries'].append({
                'teamId': tid,
                'rank': rank,
                'solved': solved,
                'penalty': penalty,
                'problems': team_problems,
            })
        return standings

    def login(self, session: requests.Session) -> None:
        r = session.get(self._options.login_url)
        r.raise_for_status()

        doc = bs4.BeautifulSoup(r.text, 'html5lib')
        form = doc.select('#loginform form')[0]

        params = {}
        for kv in form.select('input[type=hidden]'):
            params[kv.attrs['name']] = kv.attrs['value']
        params['_username'] = self._options.login_user
        params['_password'] = self._options.login_password

        r = session.post(self._options.login_url, params)
        r.raise_for_status()

        doc = bs4.BeautifulSoup(r.text, 'html5lib')
        alerts = doc.select('#loginform .login-content .alert')
        if alerts:
            raise Exception('Login failed: %s' % alerts[0].get_text())
