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
import json
import logging
from typing import Any

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


class DomjudgeApiScraper(base.Scraper):
    def __init__(self, options: argparse.Namespace):
        self._options = options

    def get_urls(self, base_url: str) -> list[str]:
        """Declare the three API endpoints needed."""
        return [
            f'{base_url}/problems',
            f'{base_url}/scoreboard',
            f'{base_url}/teams',
        ]

    def scrape_impl(self, resources: dict[str, bytes]) -> dict[str, Any]:
        """Scrape DOMjudge contest data using the REST API.

        Args:
            resources: Dict mapping URL to raw bytes

        Returns:
            Dictionary with 'problems' and 'entries' keys in LiveSite format
        """
        problems_url = next(url for url in resources.keys() if url.endswith('/problems'))
        scoreboard_url = next(url for url in resources.keys() if url.endswith('/scoreboard'))
        teams_url = next(url for url in resources.keys() if url.endswith('/teams'))

        problems_data = json.loads(resources[problems_url])
        scoreboard_data = json.loads(resources[scoreboard_url])
        teams_data = json.loads(resources[teams_url])

        team_id_to_name = {team['id']: team['name'] for team in teams_data}

        standings = {'problems': [], 'entries': []}

        for problem in problems_data:
            color = problem.get('rgb', _DEFAULT_COLORS[len(standings['problems']) % len(_DEFAULT_COLORS)])
            standings['problems'].append({
                'label': problem['label'],
                'name': problem['label'],
                'color': color,
            })

        for row in scoreboard_data.get('rows', []):
            api_team_id = row['team_id']
            rank = row['rank']
            score = row['score']

            # Extract team ID from team name prefix.
            # Expected format: "ID: Name" where ID is parsed to integer
            # TODO: utilize "display name" and "name" to have clean display name.
            team_name = team_id_to_name.get(api_team_id, '')
            try:
                team_id = str(int(team_name.split(':', 1)[0], 10))
            except (ValueError, IndexError):
                logging.warning('Skipping team %s (name: "%s") - does not match "ID: Name" format',
                                api_team_id, team_name)
                continue

            team_problems = []
            for problem in row['problems']:
                solved = problem['solved']
                attempts = problem['num_judged']
                pendings = problem['num_pending']
                first_to_solve = problem.get('first_to_solve', False)
                penalty = problem.get('time', 0) if solved else 0

                problem_entry = {
                    'solved': solved,
                    'penalty': penalty,
                    'attempts': attempts,
                    'pendings': pendings,
                }

                if self._options.extract_first_ac:
                    problem_entry['isFirst'] = first_to_solve

                team_problems.append(problem_entry)

            standings['entries'].append({
                'teamId': team_id,
                'rank': rank,
                'solved': score['num_solved'],
                'penalty': score['total_time'],
                'problems': team_problems,
            })

        if len(standings['entries']) == 0 or len(standings['problems']) == 0:
            raise Exception('Scoreboard is empty.')

        return standings

    def has_credentials(self) -> bool:
        """Check if login credentials are configured."""
        return (hasattr(self._options, 'login_user') and
                self._options.login_user is not None and
                self._options.login_user != '')

    def login(self, session: requests.Session) -> None:
        """Configure session with HTTP Basic Authentication.

        Args:
            session: requests.Session to configure with auth credentials
        """
        if not hasattr(self._options, 'login_user') or not self._options.login_user:
            raise Exception('Login username not provided. Use --login-user and --login-password')

        if not hasattr(self._options, 'login_password') or not self._options.login_password:
            raise Exception('Login password not provided. Use --login-password')

        session.auth = (self._options.login_user, self._options.login_password)
        logging.info('Configured Basic Auth for user: %s', self._options.login_user)
