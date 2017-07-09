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
gflags.DEFINE_string('name', None, 'New team name')
gflags.DEFINE_string('university', None, 'New team university')
gflags.DEFINE_string('password', None, 'New team password')
gflags.DEFINE_string('prefecture', 'その他', '')
gflags.MarkFlagAsRequired('url')
gflags.MarkFlagAsRequired('api_key')
gflags.MarkFlagAsRequired('id')
gflags.MarkFlagAsRequired('name')
gflags.MarkFlagAsRequired('university')
gflags.MarkFlagAsRequired('password')


PREFECTURES = [
  u'-',
  u'北海道',
  u'青森県',
  u'岩手県',
  u'宮城県',
  u'秋田県',
  u'山形県',
  u'福島県',
  u'茨城県',
  u'栃木県',
  u'群馬県',
  u'埼玉県',
  u'千葉県',
  u'東京都',
  u'神奈川県',
  u'新潟県',
  u'富山県',
  u'石川県',
  u'福井県',
  u'山梨県',
  u'長野県',
  u'岐阜県',
  u'静岡県',
  u'愛知県',
  u'三重県',
  u'滋賀県',
  u'京都府',
  u'大阪府',
  u'兵庫県',
  u'奈良県',
  u'和歌山県',
  u'鳥取県',
  u'島根県',
  u'岡山県',
  u'広島県',
  u'山口県',
  u'徳島県',
  u'香川県',
  u'愛媛県',
  u'高知県',
  u'福岡県',
  u'佐賀県',
  u'長崎県',
  u'熊本県',
  u'大分県',
  u'宮崎県',
  u'鹿児島県',
  u'沖縄県',
  u'その他',
]


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
                'members': [{
                    'name': '',
                    'icon': '/images/default-icon.png',
                    'comment': '',
                    'codeforcesId': '',
                    'githubId': '',
                    'topcoderId': '',
                    'twitterId': '',
                } for i in xrange(3)],
                'photo': '/images/default-photo.png',
                'prefecture': PREFECTURES.index(FLAGS.prefecture.decode('utf-8')),
            },
        },
    }
    data = {
        'api_key': FLAGS.api_key,
        'update': json.dumps(update),
    }
    response = requests.post(
        '%s/api/admin/update/teams' % FLAGS.url, data=data)

    update = {'$set': {FLAGS.id: sha256_crypt.encrypt(FLAGS.password), }, }
    data = {
        'api_key': FLAGS.api_key,
        'update': json.dumps(update),
    }
    response = requests.post('%s/api/admin/update/auth' % FLAGS.url, data=data)


if __name__ == '__main__':
    sys.exit(main(FLAGS(sys.argv)))
