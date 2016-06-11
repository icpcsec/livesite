import sys

import bottle
import gflags
import wsgiprof

from livesite import handler as handler_import_only
from livesite import setup

FLAGS = gflags.FLAGS

gflags.DEFINE_bool('profile', False, 'Enable profiler.')

app = bottle.default_app()

assert __name__ == 'livesite.wsgi_main'

setup.setup_common()
setup.setup_database()


if FLAGS.profile:
  app = wsgiprof.ProfileMiddleware(app)
