#!/usr/bin/env python3
"""Golden data tests for scrapers.

This test suite runs scrapers against saved HTML/JSON files and compares
the output against saved expected outputs to ensure consistency.
"""

import difflib
import json
import subprocess
import sys
from pathlib import Path

import pytest


# Base directory for test files
TEST_DIR = Path(__file__).parent
CLIENT_DIR = TEST_DIR.parent

# Test registry: Add new tests here
TESTS = [
    # DOMjudge HTML scraper tests
    {
        'scraper': 'domjudge',
        'name': 'frozen',
        'description': 'Frozen standings with pending submissions',
        'input': 'golden/domjudge/frozen/input.html',
        'expected': 'golden/domjudge/frozen/expected.json',
        'args': {'extract_first_ac': True},
    },
    {
        'scraper': 'domjudge',
        'name': 'final',
        'description': 'Final standings with all submissions revealed',
        'input': 'golden/domjudge/final/input.html',
        'expected': 'golden/domjudge/final/expected.json',
        'args': {'extract_first_ac': True},
    },

    # Domestic HTML scraper tests
    {
        'scraper': 'domestic',
        'name': 'sample',
        'description': 'Domestic contest standings',
        'input': 'golden/domestic/sample/input.html',
        'expected': 'golden/domestic/sample/expected.json',
        'args': {},
    },

    # DOMjudge API scraper tests
    {
        'scraper': 'domjudge-api',
        'name': 'final',
        'description': 'Full API scoreboard with credentials',
        'input': 'golden/domjudge-api/final/input',
        'expected': 'golden/domjudge-api/final/expected.json',
        'args': {'extract_first_ac': True},
    },
    {
        'scraper': 'domjudge-api',
        'name': 'public',
        'description': 'Public/frozen API scoreboard',
        'input': 'golden/domjudge-api/public/input',
        'expected': 'golden/domjudge-api/public/expected.json',
        'args': {'extract_first_ac': True},
    },
]


def run_scraper(test: dict) -> dict:
    """Run scraper on test input and return parsed output.

    Args:
        test: Test metadata dict

    Returns:
        Parsed JSON output from scraper

    Raises:
        subprocess.CalledProcessError: If scraper fails
        json.JSONDecodeError: If output is not valid JSON
    """
    # Build command
    cmd = [
        sys.executable,
        'livecli.py',
        'scrape',
        test['scraper'],
        '--test-with-local-file', test['input'],
    ]

    # Add scraper-specific arguments
    for arg, value in test['args'].items():
        if value is True:
            cmd.append(f'--{arg.replace("_", "-")}')
        elif value is not False:
            cmd.append(f'--{arg.replace("_", "-")}')
            cmd.append(str(value))

    # Run from client/ directory
    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        check=True,
        cwd=CLIENT_DIR
    )

    return json.loads(result.stdout)


@pytest.mark.parametrize(
    "test_case",
    TESTS,
    ids=lambda t: f"{t['scraper']}/{t['name']}"
)
def test_scraper_golden(test_case: dict):
    """Run a single golden test case.

    Args:
        test_case: Test metadata dict from TESTS registry

    Raises:
        AssertionError: If scraper output doesn't match expected output
    """
    input_path = TEST_DIR / test_case['input']
    expected_path = TEST_DIR / test_case['expected']

    with open(expected_path) as f:
        expected = json.load(f)

    test_with_resolved_path = {**test_case, 'input': str(input_path)}
    actual = run_scraper(test_with_resolved_path)

    if actual != expected:
        # Generate formatted JSON strings for comparison
        expected_str = json.dumps(expected, indent=2, sort_keys=True)
        actual_str = json.dumps(actual, indent=2, sort_keys=True)

        diff = difflib.unified_diff(
            expected_str.splitlines(keepends=True),
            actual_str.splitlines(keepends=True),
            fromfile='expected',
            tofile='actual',
            lineterm=''
        )

        # Limit diff output to first 100 lines to avoid overwhelming output
        diff_output = list(diff)
        diff_lines = diff_output[:100]
        diff_str = ''.join(diff_lines)

        if len(diff_output) > 100:
            diff_str += f'\n... (diff truncated, showing first 100 lines of {len(diff_output)} total)'

        pytest.fail(
            f"Scraper output differs from expected for {test_case['scraper']}/{test_case['name']}\n"
            f"Description: {test_case['description']}\n\n"
            f"Diff:\n{diff_str}"
        )
