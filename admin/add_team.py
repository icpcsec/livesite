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
gflags.DEFINE_string('id', None, 'New team ID')
gflags.DEFINE_string('name', None, 'New team name')
gflags.DEFINE_string('university', None, 'New team university')
gflags.DEFINE_string('password', None, 'New team password')
gflags.DEFINE_boolean('hidden', False, 'Hide new team')
gflags.MarkFlagAsRequired('url')
gflags.MarkFlagAsRequired('api_key')
gflags.MarkFlagAsRequired('id')
gflags.MarkFlagAsRequired('name')
gflags.MarkFlagAsRequired('university')
gflags.MarkFlagAsRequired('password')


def main(unused_argv):
  teams_map = requests.get('%s/api/teams.json' % FLAGS.url).json()
  if FLAGS.id in teams_map:
    return 'Team ID "%s" conflicts with an existing team!' % FLAGS.id

  update = {
      '$set': {
          FLAGS.id: {
              'id': FLAGS.id,
              'name': FLAGS.name,
              'university': FLAGS.university,
              'photo': '/images/default-photo.png',
              'members': [{
                  'name': u'メンバー%d' % (i + 1),
                  'topcoderId': '',
                  'codeforcesId': '',
                  'twitterId': '',
                  'githubId': '',
                  'comment': '',
                  'icon': '/images/default-icon.png',
              } for i in xrange(3)],
          },
      },
  }
  data = {
      'api_key': FLAGS.api_key,
      'update': json.dumps(update),
  }
  response = requests.post('%s/api/admin/update/teams' % FLAGS.url, data=data)

  update = {
      '$set': {
          FLAGS.id: sha256_crypt.encrypt(FLAGS.password),
      },
  }
  data = {
      'api_key': FLAGS.api_key,
      'update': json.dumps(update),
  }
  response = requests.post('%s/api/admin/update/auth' % FLAGS.url, data=data)


if __name__ == '__main__':
  sys.exit(main(FLAGS(sys.argv)))
