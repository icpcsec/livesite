import argparse
import logging
import readline  # For readline support in input()
import sys
import urllib.parse

import google_auth_oauthlib.flow

from livecli.commands import verify_credentials
from livecli import clients
from livecli import constants
from livecli import types


def setup_main(options: argparse.Namespace) -> None:
    gs_url_prefix = input('Google Cloud Storage URL? ')
    p = urllib.parse.urlparse(gs_url_prefix)
    if p.scheme != 'gs':
        logging.error('URL must begin with gs://.')
        sys.exit(1)

    # Initiate Google OAuth2 authorization.
    flow = google_auth_oauthlib.flow.InstalledAppFlow.from_client_config(
        constants.CLIENT_CONFIG, scopes=constants.SCOPES)
    creds = flow.run_console()
    user_info = {
        'client_id': creds.client_id,
        'client_secret': creds.client_secret,
        'refresh_token': creds.refresh_token,
    }

    new_config = types.Config(
        gs_url_prefix=gs_url_prefix, user_info=user_info)
    new_client = clients.ProdClient(new_config)

    verify_credentials.verify_credentials(new_client)

    new_config.save(options.config_path)
    logging.info('Configs saved to %s', options.config_path)
