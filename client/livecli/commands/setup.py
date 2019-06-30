# Copyright 2019 LiveSite authors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import argparse
import json
import logging
import readline  # For readline support in input()
import sys
import urllib.parse

import google_auth_oauthlib.flow

from livecli import constants
from livecli import types


def setup_main(options: argparse.Namespace) -> None:
    project = input('Firebase project? ')

    gs_url_prefix = input('Google Cloud Storage URL? ')
    p = urllib.parse.urlparse(gs_url_prefix)
    if p.scheme != 'gs':
        logging.error('URL must begin with gs://.')
        sys.exit(1)

    # Initiate Google OAuth2 authorization.
    if options.service_account_json:
        with open(options.service_account_json) as f:
            user_info = json.load(f)
    else:
        flow = google_auth_oauthlib.flow.InstalledAppFlow.from_client_config(
            constants.CLIENT_CONFIG, scopes=constants.SCOPES)
        creds = flow.run_console()
        user_info = {
            'client_id': creds.client_id,
            'client_secret': creds.client_secret,
            'refresh_token': creds.refresh_token,
        }

    new_config = types.Config(
        project=project,
        gs_url_prefix=gs_url_prefix,
        user_info=user_info)

    new_config.save(options.config_path)
    logging.info('Configs saved to %s', options.config_path)
