import argparse

from livecli import constants
from livecli.commands import scrape
from livecli.commands import setup
from livecli.commands import upload
from livecli.commands import verify_credentials
from livecli.scrapers import domestic
from livecli.scrapers import domjudge
from livecli.scrapers import domjudge_api


def make_parser() -> argparse.ArgumentParser:
    root_parser = argparse.ArgumentParser()
    root_parser.set_defaults(handler=None)
    root_parser.add_argument(
        '--debug', action='store_true', help='Enable debug logging')
    root_parser.add_argument(
        '--config-path',
        default=constants.DEFAULT_CONFIG_PATH,
        help='Path to the config file')
    root_subparsers = root_parser.add_subparsers()

    setup_parser = root_subparsers.add_parser('setup')
    setup_parser.set_defaults(handler=setup.setup_main, local=False)
    setup_parser.add_argument(
        '--service-account-json', help='Service account JSON file')

    verify_parser = root_subparsers.add_parser('verify-credentials')
    verify_parser.set_defaults(
        handler=verify_credentials.verify_credentials_main,
        local=False)
    verify_parser.add_argument(
        '--override-project', help='Override Firebase project name')

    upload_parser = root_subparsers.add_parser('upload')
    upload_parser.set_defaults(handler=upload.upload_main)
    upload_parser.add_argument(
        '--override-project', help='Override Firebase project name')
    upload_parser.add_argument(
        '--local',
        action='store_true',
        help='Operate on the local development server')
    upload_parser.add_argument('paths', nargs='+', help='Paths to feed files')

    scrape_common_parser = argparse.ArgumentParser(add_help=False)
    scrape_common_parser.add_argument(
        '--override-project', help='Override Firebase project name')
    scrape_common_parser.add_argument(
        '--local',
        action='store_true',
        help='Operate on the local development server')
    scrape_common_parser.add_argument(
        '--scoreboard-url', help='Scoreboard URL')
    scrape_common_parser.add_argument(
        '--interval-seconds', type=int, default=10, help='Interval to scrape in seconds')
    scrape_common_parser.add_argument(
        '--pre-contest-minutes', type=int, default=10, help='When to start uploading')
    scrape_common_parser.add_argument(
        '--post-contest-minutes', type=int, default=10, help='When to stop uploading')
    scrape_common_parser.add_argument(
        '--log-dir', help='Path to log output dir')
    scrape_common_parser.add_argument(
        '--test-with-local-file',
        help='Test scraper with local files and exit without uploading. '
             'For HTML scrapers: provide file path (e.g., /tmp/scoreboard.html). '
             'For API scrapers: provide directory path (e.g., /tmp/testdata) containing problems.json, scoreboard.json, etc.')
    scrape_common_parser.add_argument(
        '--no-upload', action='store_false', dest='upload',
        help='Do not upload scraped data')

    scrape_parser = root_subparsers.add_parser('scrape')
    scrape_parser.set_defaults(handler=scrape.scrape_main)
    scrape_subparsers = scrape_parser.add_subparsers()
    scrape_subparsers.required = True
    scrape_subparsers.dest = 'scraper'

    domestic_parser = scrape_subparsers.add_parser('domestic', parents=[scrape_common_parser])
    domestic_parser.set_defaults(scraper_class=domestic.DomesticScraper)
    domestic_parser.add_argument(
        '--allow-rehearsal', action='store_true', help='Allow rehearsal')
    domestic_parser.add_argument('--login-url', help='Login URL')
    domestic_parser.add_argument('--login-user', help='Login user name')
    domestic_parser.add_argument('--login-password', help='Login password')
    domestic_parser.add_argument('--min-team-id', type=int, help='Allowed minimum team id')
    domestic_parser.add_argument('--max-team-id', type=int, help='Allowed maximum team id')

    domjudge_parser = scrape_subparsers.add_parser('domjudge', parents=[scrape_common_parser])
    domjudge_parser.set_defaults(scraper_class=domjudge.DomjudgeScraper)
    domjudge_parser.add_argument('--login-url', help='Login URL')
    domjudge_parser.add_argument('--login-user', help='Login user name')
    domjudge_parser.add_argument('--login-password', help='Login password')
    domjudge_parser.add_argument('--extract-first-ac', action='store_true', help='Extract the first AC')

    domjudge_api_parser = scrape_subparsers.add_parser('domjudge-api', parents=[scrape_common_parser])
    domjudge_api_parser.set_defaults(scraper_class=domjudge_api.DomjudgeApiScraper)
    domjudge_api_parser.add_argument('--login-user', help='Login user name for Basic Auth')
    domjudge_api_parser.add_argument('--login-password', help='Login password for Basic Auth')
    domjudge_api_parser.add_argument('--extract-first-ac', action='store_true', help='Extract the first AC')
    domjudge_api_parser.add_argument('--public', action='store_true', help='Request public scoreboard (frozen view) even with credentials')
    domjudge_api_parser.add_argument(
        '--team-id-format',
        choices=['colon-prefix', 'team-prefix'],
        default='colon-prefix',
        help='Format for extracting team ID from team name. '
             'colon-prefix: "ID: Name" (e.g., "01: TeamA") (default). '
             'team-prefix: "teamID" (e.g., "team01", "team123")')

    return root_parser
