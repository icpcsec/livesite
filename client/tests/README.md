# Golden Data Tests

Golden tests verify scrapers produce consistent output.

## Running Tests

First, install test dependencies:
```bash
pip install -r requirements-test.txt
```

Run tests with pytest:
```bash
pytest tests/                              # Run all tests
pytest tests/ -v                           # Verbose output
pytest tests/ -k domjudge                  # Filter by scraper type
pytest tests/ -k frozen                    # Filter by test name
pytest tests/ -n auto                      # Run tests in parallel
```

## Adding New Tests

1. Create test data:
```bash
mkdir -p tests/golden/domjudge/my-test
cp input.html tests/golden/domjudge/my-test/
python livecli.py scrape domjudge --test-with-local-file=... > tests/golden/domjudge/my-test/expected.json
```

2. Register in `tests/test_golden.py` TESTS list:
```python
{
    'scraper': 'domjudge',
    'name': 'my-test',
    'description': 'What this test covers',
    'input': 'golden/domjudge/my-test/input.html',
    'expected': 'golden/domjudge/my-test/expected.json',
    'args': {'extract_first_ac': True},
},
```

3. Run: `pytest tests/`
