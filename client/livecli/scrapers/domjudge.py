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

from livecli.scrapers import base


class DomjudgeScraper(base.Scraper):
    def __init__(self, options: argparse.Namespace):
        self._options = options

    def scrape_impl(self, html: str) -> dict:
        standings = {'problems': [], 'entries': []}

        doc = bs4.BeautifulSoup(html, 'html5lib')
        scoreheader_elem = doc.select('.scoreheader')[0]
        for problem_elem in scoreheader_elem.select('th')[3:]:
            label = problem_elem.get_text().strip()
            tooltip = problem_elem.attrs.get('title', '')
            if tooltip.startswith('problem '):
                name = tooltip[len('problem '):].strip(' \'')
            else:
                name = ''
            style = problem_elem.select('.circle')[0].attrs.get('style', '')
            m = re.search(r'background:\s*([^\s;]+)\s*;', style)
            color = m.group(1) if m else ''
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
            name_university = team_elem.select('.scoretn')[0].get_text().strip()
            try:
                tid = str(int(name_university.split(':', 1)[0], 10))
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
