import contextlib
import os
import signal
import subprocess
import sys
import time

import bottle
import gflags

from livesite import handler as handler_import_only
from livesite import setup

FLAGS = gflags.FLAGS

gflags.DEFINE_integer('port', 8080, 'Port to listen on.')


@contextlib.contextmanager
def watchify():
  if os.environ.get('BOTTLE_CHILD'):
    yield
    return
  try:
    os.unlink('.work/bundle.js')
  except OSError:
    pass
  p = subprocess.Popen(['make', 'watchify'], cwd='../..', preexec_fn=os.setpgrp)
  try:
    while not os.path.exists('.work/bundle.js'):
      time.sleep(0.2)
    yield
  finally:
    os.killpg(p.pid, signal.SIGTERM)
    p.wait()


def main():
  setup.setup_common()
  setup.setup_database()
  with watchify():
    bottle.run(
        # wsgiref is unstable with reloader.
        # See: https://github.com/bottlepy/bottle/issues/155
        server='paste',
        port=FLAGS.port,
        host='0.0.0.0',
        reloader=True,
        debug=True)


assert __name__ == '__main__'

sys.exit(main())
