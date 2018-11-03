import abc


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
    def scrape(self, html: str) -> dict:
        standings = self.scrape_impl(html)
        if not standings['problems']:
            standings['problems'] = _DEFAULT_PROBLEMS
            for entry in standings['entries']:
                entry['problems'] = [_INIT_PROBLEM_STATUS for _ in _DEFAULT_PROBLEMS]
        return standings

    @abc.abstractmethod
    def scrape_impl(self, html: str) -> dict:
        ...
