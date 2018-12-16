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

        if not doc.select('.scoreheader'):
            return None

        scoreheader_elem = doc.select('.scoreheader')[0]
        for problem_elem in scoreheader_elem.select('th')[3:]:
            label = problem_elem.get_text().strip()[-1]
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
        for team_elem in scoreboard_elem.select('tbody:nth-of-type(1) tr'):
            team_problems = []
            for problem_elem in team_elem.select('td')[5:]:
                text = problem_elem.get_text().strip()
                m = re.search(r'^(\d+)/(\d+)$', text)
                if m:
                    attempts, penalty1 = map(int, m.groups())
                    pendings = 0
                    penalty = penalty1  # - 20 * (attempts - 1)
                else:
                    m = re.search(r'^(\d+) \+ (\d+)$', text)
                    if m:
                        attempts, pendings = map(int, m.groups())
                        penalty = 0
                    else:
                        attempts = int(text)
                        pendings = 0
                        penalty = 0
                classes = problem_elem['class']
                solved = 'score_correct' in classes
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
                tid = int(name_university.split(':', 1)[0], 10)
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
