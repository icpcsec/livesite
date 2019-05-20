#!/usr/bin/python
# -*- coding: utf-8 -*-
#
# Copyright 2019 LiveSite authors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import csv
import json
import os
import sys

import gflags
from passlib.hash import sha256_crypt

FLAGS = gflags.FLAGS

gflags.DEFINE_string('title', None, '')
gflags.DEFINE_integer('start_time', None, '')
gflags.DEFINE_integer('freeze_time', None, '')
gflags.DEFINE_integer('end_time', None, '')
gflags.DEFINE_string('teams_csv', None, '')
gflags.DEFINE_string('output_dir', None, '')
gflags.MarkFlagAsRequired('title')
gflags.MarkFlagAsRequired('start_time')
gflags.MarkFlagAsRequired('freeze_time')
gflags.MarkFlagAsRequired('end_time')
gflags.MarkFlagAsRequired('teams_csv')
gflags.MarkFlagAsRequired('output_dir')


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
    teams = []
    with open(FLAGS.teams_csv) as raw_in:
        csv_in = csv.DictReader(raw_in)
        for team in csv_in:
            for key in team:
                team[key] = team[key].decode('utf-8')
            if team['status'] in ('PENDING', 'ACCEPTED'):
                teams.append(team)

    # contest.json
    contest_data = {
        'title': FLAGS.title.decode('utf-8'),
        'times': {
            'start': FLAGS.start_time,
            'freeze': FLAGS.freeze_time,
            'end': FLAGS.end_time,
        },
        'problems': [],
    }
    with open(os.path.join(FLAGS.output_dir, 'contest.json'), 'w') as f:
        json.dump(contest_data, f, indent=2, sort_keys=True)

    # teams.json
    teams_data = {
        team['public_id']: {
            'id': team['public_id'],
            'name': team['name'],
            'university': team['university'],
            'country': None,
            'members': [{
                'name': '',
                'icon': '/images/default-icon.png',
                'comment': '',
                'atcoderId': '',
                'codeforcesId': '',
                'githubId': '',
                'topcoderId': '',
                'twitterId': '',
            } for i in xrange(3)],
            'photo': '/images/default-photo.png',
            'prefecture': PREFECTURES.index(team['prefecture']),
        }
        for team in teams
    }
    with open(os.path.join(FLAGS.output_dir, 'teams.json'), 'w') as f:
        json.dump(teams_data, f, indent=2, sort_keys=True)

    # standings.json
    standings_data = [{
        'rank': '-',
        'teamId': team['public_id'],
        'solved': 0,
        'penalty': 0,
        'problems': [],
    } for team in teams]
    standings_data.sort(key=lambda t: int(t['teamId']))
    with open(os.path.join(FLAGS.output_dir, 'standings.json'), 'w') as f:
        json.dump(standings_data, f, indent=2, sort_keys=True)

    # auth.json
    auth_data = {
        team['public_id']: sha256_crypt.encrypt(team['password_web'], rounds=1000)
        for team in teams
    }
    with open(os.path.join(FLAGS.output_dir, 'auth.json'), 'w') as f:
        json.dump(auth_data, f, indent=2, sort_keys=True)


if __name__ == '__main__':
    sys.exit(main(FLAGS(sys.argv)))
