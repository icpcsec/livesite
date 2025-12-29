# LiveSite Advanced Topics

## Adding Support for Other Contest Systems

LiveSite supports DOMjudge (HTML and API modes) out of the box. You can add support for other contest systems by implementing a custom scraper.

### Scraper Interface

Implement `client/livecli/scrapers/base.Scraper`:

```python
class Scraper(abc.ABC):
    def get_urls(self, base_url: str) -> list:
        """Return list of URLs to fetch. Default: [base_url]"""
        return [base_url]

    @abc.abstractmethod
    def scrape_impl(self, resources: dict) -> dict:
        """Parse resources (URL -> bytes) into standings dict"""
        ...
```

### HTML Scraper Example

For single-page HTML scoreboards:

```python
from .base import Scraper
import bs4

class MySystemScraper(Scraper):
    def scrape_impl(self, resources: dict) -> dict:
        html = next(iter(resources.values())).decode('utf-8')
        doc = bs4.BeautifulSoup(html, 'html5lib')
        # Parse and return {'problems': [...], 'entries': [...]}
```

See `client/livecli/scrapers/domjudge.py` for a complete example.

### API Scraper Example

For REST APIs with multiple endpoints:

```python
from .base import Scraper
import json

class MySystemApiScraper(Scraper):
    def get_urls(self, base_url: str) -> list:
        return [f'{base_url}/problems', f'{base_url}/scoreboard']

    def scrape_impl(self, resources: dict) -> dict:
        problems_url = next(url for url in resources.keys() if url.endswith('/problems'))
        problems = json.loads(resources[problems_url])
        # Parse and return {'problems': [...], 'entries': [...]}
```

See `client/livecli/scrapers/domjudge_api.py` for a complete example.

### Output Format

```python
{
    "problems": [
        {"label": "A", "name": "Problem A", "color": "#FF0000"},
    ],
    "entries": [
        {
            "teamId": "1",
            "rank": 1,
            "solved": 3,
            "penalty": 245,
            "problems": [
                {"solved": true, "penalty": 45, "attempts": 1, "pendings": 0},
            ]
        }
    ]
}
```

### Registration and Testing

**1. Register in `client/livecli/commands/__init__.py`:**

```python
from livecli.scrapers import mysystem

mysystem_parser = scrape_subparsers.add_parser('mysystem', parents=[scrape_common_parser])
mysystem_parser.set_defaults(scraper_class=mysystem.MySystemScraper)
```

**2. Test with local files:**

```bash
# HTML scraper: provide file path
python livecli.py scrape mysystem --test-with-local-file=/tmp/scoreboard.html

# API scraper: provide directory with problems.json, scoreboard.json, etc.
python livecli.py scrape mysystem --test-with-local-file=/tmp/testdata
```

### Optional Features

**Authentication:** Override `login(session)` and raise `NeedLoginException` from `scrape_impl()` when login is required. The session is passed as a parameter.
