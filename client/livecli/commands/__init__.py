import argparse

from livecli import constants
from livecli import types
from livecli.commands import scrape
from livecli.commands import setup
from livecli.commands import upload
from livecli.commands import verify_credentials
from livecli.scrapers import domestic
from livecli.scrapers import domjudge


def make_parser() -> argparse.ArgumentParser:
    global_parser = argparse.ArgumentParser(add_help=False)
    global_parser.add_argument(
        '--debug', action='store_true', help='Enable debug logging')
    global_parser.add_argument(
        '--config-path',
        default=constants.DEFAULT_CONFIG_PATH,
        help='Path to the config file')

    root_parser = argparse.ArgumentParser(parents=[global_parser])
    root_parser.set_defaults(handler=None)
    root_subparsers = root_parser.add_subparsers()

    setup_parser = root_subparsers.add_parser('setup', parents=[global_parser])
    setup_parser.set_defaults(handler=setup.setup_main)

    verify_parser = root_subparsers.add_parser(
        'verify-credentials', parents=[global_parser])
    verify_parser.set_defaults(
        handler=verify_credentials.verify_credentials_main,
        local=False)
    verify_parser.add_argument(
        '--project', required=True, help='Firebase project name')

    upload_parser = root_subparsers.add_parser(
        'upload', parents=[global_parser])
    upload_parser.set_defaults(handler=upload.upload_main)
    upload_parser.add_argument(
        '--project', help='Firebase project name')
    upload_parser.add_argument(
        '--local',
        action='store_true',
        help='Operate on the local development server')
    upload_parser.add_argument('paths', nargs='+', help='Paths to feed files')

    scrape_common_parser = argparse.ArgumentParser(add_help=False)
    scrape_common_parser.add_argument(
        '--project', help='Firebase project name')
    scrape_common_parser.add_argument(
        '--local',
        action='store_true',
        help='Operate on the local development server')
    scrape_common_parser.add_argument(
        '--scoreboard-url', help='Scoreboard URL')
    scrape_common_parser.add_argument(
        '--interval-seconds', type=int, default=10, help='Interval to scrape in seconds')
    scrape_common_parser.add_argument(
        '--log-dir', help='Path to log output dir')
    scrape_common_parser.add_argument(
        '--test-with-local-file', help='Scrape from a file and exit without uploading')

    scrape_parser = root_subparsers.add_parser('scrape', parents=[global_parser])
    scrape_parser.set_defaults(handler=scrape.scrape_main)
    scrape_subparsers = scrape_parser.add_subparsers()
    scrape_subparsers.required = True
    scrape_subparsers.dest = 'scraper'

    domestic_parser = scrape_subparsers.add_parser('domestic', parents=[global_parser, scrape_common_parser])
    domestic_parser.set_defaults(scraper_class=domestic.DomesticScraper)
    domestic_parser.add_argument(
        '--allow-rehearsal', action='store_true', help='Allow rehearsal')

    domjudge_parser = scrape_subparsers.add_parser('domjudge', parents=[global_parser, scrape_common_parser])
    domjudge_parser.set_defaults(scraper_class=domjudge.DomjudgeScraper)
    return root_parser
