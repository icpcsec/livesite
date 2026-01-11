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
import re
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

    def get_urls(self, base_url: str) -> dict[str, str]:
        """Declare the three API endpoints needed.

        Returns:
            Dict mapping resource keys to URLs:
            - 'problems': problems endpoint
            - 'scoreboard': scoreboard endpoint (with ?public=true if --public flag set)
            - 'teams': teams endpoint
        """
        # Add ?public=true to scoreboard URL if --public flag is set
        scoreboard_url = f'{base_url}/scoreboard'
        if hasattr(self._options, 'public') and self._options.public:
            scoreboard_url += '?public=true'

        return {
            'problems': f'{base_url}/problems',
            'scoreboard': scoreboard_url,
            'teams': f'{base_url}/teams',
        }

    def _extract_team_id(self, team_name: str) -> str | None:
        """Extract team ID based on configured format.

        Args:
            team_name: Team name from DOMjudge teams endpoint

        Returns:
            Extracted team ID as string, or None if extraction fails
        """
        format_type = getattr(self._options, 'team_id_format', 'colon-prefix')

        if format_type == 'colon-prefix':
            # "01: TeamName" -> "1"
            try:
                return str(int(team_name.split(':', 1)[0], 10))
            except (ValueError, IndexError):
                return None

        elif format_type == 'team-prefix':
            # "team12" -> "12", "team03" -> "3"
            match = re.match(r'^team(\d+)', team_name, re.IGNORECASE)
            if match:
                return str(int(match.group(1), 10))
            return None

        return None

    def scrape_impl(self, resources: dict[str, bytes]) -> dict[str, Any]:
        """Scrape DOMjudge contest data using the REST API.

        Args:
            resources: Dict mapping resource key to raw bytes

        Returns:
            Dictionary with 'problems' and 'entries' keys in LiveSite format
        """
        problems_data = json.loads(resources['problems'])
        scoreboard_data = json.loads(resources['scoreboard'])
        teams_data = json.loads(resources['teams'])

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

            # Extract team ID using configured format
            team_name = team_id_to_name.get(api_team_id, '')
            team_id = self._extract_team_id(team_name)
            if team_id is None:
                format_type = getattr(self._options, 'team_id_format', 'colon-prefix')
                expected_format = '"ID: Name"' if format_type == 'colon-prefix' else '"teamID"'
                logging.warning('Skipping team %s (name: "%s") - does not match %s format',
                                api_team_id, team_name, expected_format)
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
