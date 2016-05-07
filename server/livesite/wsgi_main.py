import sys

import bottle
import gflags

from livesite import handler as handler_import_only
from livesite import setup

FLAGS = gflags.FLAGS

app = bottle.default_app()

assert __name__ == 'livesite.wsgi_main'

setup.setup()
