import argparse
import logging
import sys

from livecli import clients


def verify_credentials(client: clients.Client) -> None:
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
    client = clients.create_client(options)
    verify_credentials(client)
