import argparse
import logging
import sys

from livecli import clients
from livecli import types


def verify_credentials(config: types.Config) -> None:
    client = clients.LiveClient(config)

    email = client.get_email()
    if not email:
        sys.exit(1)
    logging.info('Logged in as: %s', email)

    if not client.verify_database_permission():
        sys.exit(1)

    if not client.verify_storage_permission():
        sys.exit(1)

    logging.info('OK.')


def verify_credentials_main(options: argparse.Namespace) -> None:
    config = types.Config.load(options.config_path)
    verify_credentials(config)
