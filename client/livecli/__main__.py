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
