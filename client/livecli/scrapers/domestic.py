import argparse
import logging
from typing import Tuple

import bs4

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

    def scrape_impl(self, html: str) -> Tuple[list, list]:
        problems = []
        standings = []
        if 'rehearsal' in html and not self._options.allow_rehearsal:
            logging.info('Contest has not started yet.')
            return problems, standings

        doc = bs4.BeautifulSoup(html, 'html5lib')
        mains = doc.select('.main')
        if not mains:
            return problems, standings

        table = mains[-1].table
        if not table:
            return problems, standings

        for tr in table.select('tr'):
            row = [td.get_text().strip() for td in tr.select('td')]

            if row[0] == 'rank':
                # Header row: scrape problems.
                for label, color in zip(row[6:], _PROBLEM_COLORS):
                    problems.append({
                        'label': label,
                        'name': 'Problem %s' % label,
                        'color': color,
                    })
                continue

            team = dict(zip(_TEAM_COLUMNS, row))
            team['solved'] = int(team['solved'])
            team['penalty'] = int(team['penalty'])
            del team[None]

            team['problems'] = [_parse_problem_status(col) for col in row[6:]]
            standings.append(team)

        return problems, standings
