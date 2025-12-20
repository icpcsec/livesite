# LiveSite Advanced Topics

## Adding Support for Other Contest Systems

LiveSite currently supports DOMjudge out of the box, but you can add support for other contest management systems by implementing a custom scraper module.

### Scraper Architecture Overview

The scraper system is built around an abstract base class that defines the contract for parsing contest data:

**Location**: `client/livecli/scrapers/base.py`

```python
class Scraper(abc.ABC):
    @abc.abstractmethod
    def scrape_impl(self, html: str) -> dict:
        """Parse HTML and return standings dictionary"""
        ...
```

### Implementing a Custom Scraper

**Step 1: Create a new scraper module**

Create a new file in `client/livecli/scrapers/` (e.g., `mysystem.py`):

```python
from .base import Scraper

class MySystemScraper(Scraper):
    def scrape_impl(self, html: str) -> dict:
        # Parse the HTML from your contest system
        # Return a dictionary with the required structure
        pass
```

**Step 2: Parse and return the expected format**

Your scraper must return a dictionary matching this structure:

```python
{
    "problems": [
        {"id": "A", "label": "A", "name": "Problem A"},
        {"id": "B", "label": "B", "name": "Problem B"},
        # ...
    ],
    "entries": [
        {
            "team_id": "1",
            "rank": 1,
            "solved": 3,
            "time": 245,  # penalty time in minutes
            "problems": [
                {"solved": True, "time": 45, "num_judged": 1, "num_pending": 0},
                {"solved": False, "time": 0, "num_judged": 2, "num_pending": 0},
                # ... one entry per problem
            ]
        },
        # ... one entry per team
    ]
}
```

**Reference**: See `client/livecli/scrapers/domjudge.py` for a complete working example using BeautifulSoup to parse HTML.

**Step 3: Register your scraper in the CLI**

Edit `client/livecli/commands/__init__.py` to add your scraper:

```python
from livecli.scrapers import mysystem

# In the scrape_subparsers section:
mysystem_parser = scrape_subparsers.add_parser('mysystem', parents=[scrape_common_parser])
mysystem_parser.set_defaults(scraper_class=mysystem.MySystemScraper)
```

**Step 4: Test your scraper**

```bash
# Download a sample scoreboard page from your contest system
curl https://your-contest.example.com/scoreboard > test.html

# Test the scraper
python livecli.py scrape mysystem --test-with-local-file test.html > output.json

# Verify the output structure
cat output.json | jq .
```

### Key Considerations

**Team ID Extraction**: Your scraper must extract numeric team IDs. The DOMjudge scraper expects team names in the format `{id}: {name}` (e.g., `01: TeamA`). Adjust your parsing logic based on your contest system's format.

**Problem Status**: For each problem attempt, you need to determine:
- `solved`: Boolean indicating if the team has an accepted solution
- `time`: Time of first AC in minutes from contest start (0 if not solved)
- `num_judged`: Number of judged submissions (for penalty calculation)
- `num_pending`: Number of pending submissions (shown during scoreboard freeze)

**Scoreboard Freeze**: If your contest system supports scoreboard freeze, ensure pending submissions after the freeze time are counted in `num_pending`.

### Example: DOMjudge Scraper Structure

The DOMjudge scraper (`client/livecli/scrapers/domjudge.py`) demonstrates:

1. Using BeautifulSoup to parse HTML tables
2. Extracting problem list from table headers
3. Parsing team rows to extract rank, solved count, penalty time
4. Extracting individual problem statuses (AC/WA/pending) with submission counts
5. Building the required JSON structure

Refer to this implementation as a template for your custom scraper.
