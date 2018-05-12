import argparse
import logging
import readline  # For readline support in input()
import sys
import urllib.parse

import google_auth_oauthlib.flow

from livecli.commands import verify_credentials
from livecli import constants
from livecli import types


def setup_main(options: argparse.Namespace) -> None:
    project = input('Google Cloud Platform project ID? ')
    if not project:
        logging.error('Empty project ID is not allowed.')
        sys.exit(1)

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
        project=project, gs_url_prefix=gs_url_prefix, user_info=user_info)

    verify_credentials.verify_credentials(new_config)

    new_config.save(options.config_path)
    logging.info('Configs saved to %s', options.config_path)
