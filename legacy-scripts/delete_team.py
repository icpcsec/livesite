# -*- coding: utf-8 -*-

import json
import sys

import gflags
from passlib.hash import sha256_crypt
import requests

FLAGS = gflags.FLAGS

gflags.DEFINE_string('url', None, 'URL of livesite')
gflags.DEFINE_string('api_key', None, 'API key')
gflags.DEFINE_string('id', None, 'New team ID')
gflags.MarkFlagAsRequired('url')
gflags.MarkFlagAsRequired('api_key')
gflags.MarkFlagAsRequired('id')


def main(unused_argv):
  update = {
      '$unset': {
          FLAGS.id: '',
      },
  }
  data = {
      'api_key': FLAGS.api_key,
      'update': json.dumps(update),
  }
  response = requests.post('%s/api/admin/update/teams' % FLAGS.url, data=data)

  update = {
      '$unset': {
          FLAGS.id: '',
      },
  }
  data = {
      'api_key': FLAGS.api_key,
      'update': json.dumps(update),
  }
  response = requests.post('%s/api/admin/update/auth' % FLAGS.url, data=data)


if __name__ == '__main__':
  sys.exit(main(FLAGS(sys.argv)))
