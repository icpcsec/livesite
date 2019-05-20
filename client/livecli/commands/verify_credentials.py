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
