import abc
from typing import Tuple


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


class Scraper(abc.ABC):
    def scrape(self, html: str) -> Tuple[list, list]:
        problems, standings = self.scrape_impl(html)
        if not problems:
            problems = _DEFAULT_PROBLEMS
            for team in standings:
                team['problems'] = [_INIT_PROBLEM_STATUS for _ in problems]
        return problems, standings

    @abc.abstractmethod
    def scrape_impl(self, html: str) -> Tuple[list, list]:
        ...
