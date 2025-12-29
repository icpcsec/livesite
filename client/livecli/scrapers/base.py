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

import abc

import requests

_DEFAULT_PROBLEMS = [
    {
        'name': 'A',
        'label': 'A',
        'color': 'red',
    },
    {
        'name': 'B',
        'label': 'B',
        'color': 'green',
    },
    {
        'name': 'C',
        'label': 'C',
        'color': 'blue',
    },
]

_INIT_PROBLEM_STATUS = {
    'attempts': 0,
    'pendings': 0,
    'penalty': 0,
    'solved': False,
}


class NeedLoginException(Exception):
    pass


class Scraper(abc.ABC):
    def get_urls(self, base_url: str) -> list:
        """Return list of URLs to fetch.

        Default implementation returns single URL (base_url).
        Override for scrapers that need multiple URLs.

        Args:
            base_url: Base URL from --scoreboard-url

        Returns:
            List of URLs to fetch
        """
        return [base_url]

    def scrape(self, resources: dict) -> dict:
        """Parse resources into standings format.

        Args:
            resources: Dict mapping URL to raw bytes
        """
        standings = self.scrape_impl(resources)
        if not standings['problems']:
            standings['problems'] = _DEFAULT_PROBLEMS
            for entry in standings['entries']:
                entry['problems'] = [_INIT_PROBLEM_STATUS for _ in _DEFAULT_PROBLEMS]
        return standings

    @abc.abstractmethod
    def scrape_impl(self, resources: dict) -> dict:
        """Parse resources into standings.

        Args:
            resources: Dict mapping URL to raw response bytes

        Returns:
            Dict with 'problems' and 'entries' keys
        """
        ...

    def login(self, session: requests.Session) -> None:
        pass
