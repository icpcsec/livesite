# -*- coding: utf-8 -*-

import logging
import logging.handlers
import os
import sys

import bottle
import gflags
from passlib.hash import sha256_crypt

from livesite import model

FLAGS = gflags.FLAGS

gflags.DEFINE_bool('logtostderr', True, 'Log to stderr.')
gflags.DEFINE_bool('logtosyslog', True, 'Log to syslog.')


def setup_logging():
  root = logging.getLogger()
  root.setLevel(logging.INFO)
  formatter = logging.Formatter(
      '%(asctime)-15s %(levelname)s [%(filename)s:%(lineno)d] %(message)s',
      datefmt='%Y-%m-%d %H:%M:%S')
  if FLAGS.logtostderr:
    handler = logging.StreamHandler(sys.stderr)
    handler.setFormatter(formatter)
    root.addHandler(handler)
  if FLAGS.logtosyslog:
    handler = logging.handlers.SysLogHandler('/dev/log')
    handler.setFormatter(formatter)
    root.addHandler(handler)


def setup_bottle():
  bottle.TEMPLATE_PATH = [os.path.join(os.path.dirname(__file__), 'templates')]
  bottle.BaseRequest.MEMFILE_MAX = 8 * 1024 * 1024


def setup():
  FLAGS(sys.argv)
  setup_logging()
  setup_bottle()
