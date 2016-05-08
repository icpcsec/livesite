# -*- coding: utf-8 -*-

import json
import sys

import gflags
from passlib.hash import sha256_crypt
import requests

from livesite import model

FLAGS = gflags.FLAGS

gflags.DEFINE_string('url', None, 'URL of livesite')
gflags.DEFINE_string('api_key', None, 'API key')
gflags.DEFINE_string('feed', None, '')
gflags.DEFINE_string('json_path', None, '')
gflags.MarkFlagAsRequired('url')
gflags.MarkFlagAsRequired('api_key')
gflags.MarkFlagAsRequired('feed')
gflags.MarkFlagAsRequired('json_path')


def main(unused_argv):
  if raw_input('Are you really sure? ').strip().lower() != 'yes':
    return 'aborted.'
  with open(FLAGS.json_path) as f:
    data = json.load(f)['data']
  update = {'$set': {'': data}}
  postdata = {
      'api_key': FLAGS.api_key,
      'update': json.dumps(update),
  }
  response = requests.post('%s/api/admin/update/%s' % (FLAGS.url, FLAGS.feed), data=postdata)
  assert response.status_code == 200, response.text


if __name__ == '__main__':
  sys.exit(main(FLAGS(sys.argv)))
