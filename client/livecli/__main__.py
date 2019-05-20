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

import logging
import sys
from typing import List

from livecli import commands


def _configure_logging(debug: bool) -> None:
    logging.basicConfig(
        level=(logging.DEBUG if debug else logging.INFO),
        format=('%(asctime)s.%(msecs)03d %(levelname)s '
                '[%(filename)s:%(lineno)d] %(message)s'),
        datefmt='%Y-%m-%d %H:%M:%S')


def main(argv: List[str]) -> None:
    parser = commands.make_parser()
    options = parser.parse_args(argv[1:])
    _configure_logging(options.debug)

    if not options.handler:
        parser.print_help()
        sys.exit(1)
    try:
        options.handler(options)
    except (KeyboardInterrupt, EOFError):
        if options.debug:
            raise
        sys.exit(1)


if __name__ == '__main__':
    main(sys.argv)
