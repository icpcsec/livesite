import contextlib
import logging
import os
import signal
import subprocess
import sys
import time

import bottle
import gflags

from livesite import handler as handler_import_only
from livesite import setup
from livesite import siteconfig

FLAGS = gflags.FLAGS

gflags.DEFINE_integer('port', 8080, 'Port to listen on.')

_BUNDLE_JS_PATH = 'static/assets/livesite/js/bundle.js'


@contextlib.contextmanager
def watchify():
    if os.environ.get('BOTTLE_CHILD'):
        yield
        return
    logging.info('Building bundle.js...')
    link_target = os.readlink(_BUNDLE_JS_PATH)
    assert link_target.startswith('/'), 'bundle.js link must be absolute'
    try:
        os.unlink(link_target)
    except OSError:
        pass
    p = subprocess.Popen(
        ['make', '_watchify'], cwd='../..', preexec_fn=os.setpgrp)
    try:
        while not os.path.exists(_BUNDLE_JS_PATH):
            time.sleep(0.2)
        yield
    finally:
        os.killpg(p.pid, signal.SIGTERM)
        p.wait()


def main():
    setup.setup_common()
    setup.setup_database()
    siteconfig.watch_for_development()
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
