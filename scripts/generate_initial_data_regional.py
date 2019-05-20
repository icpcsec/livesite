#!/usr/bin/python
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
gflags.DEFINE_string('problems_csv', None, '')
gflags.DEFINE_string('output_dir', None, '')
gflags.DEFINE_bool('enable_members', False, '')
gflags.MarkFlagAsRequired('title')
gflags.MarkFlagAsRequired('start_time')
gflags.MarkFlagAsRequired('freeze_time')
gflags.MarkFlagAsRequired('end_time')
gflags.MarkFlagAsRequired('teams_csv')
gflags.MarkFlagAsRequired('problems_csv')
gflags.MarkFlagAsRequired('output_dir')


def main(unused_argv):
    teams = []
    with open(FLAGS.teams_csv) as raw_in:
        csv_in = csv.DictReader(raw_in)
        for team in csv_in:
            for key in team:
                team[key] = team[key].decode('utf-8')
            if not FLAGS.enable_members or team['password_web'] not in ('', '-'):
                teams.append(team)

    problems = []
    with open(FLAGS.problems_csv) as raw_in:
        problems = list(csv.DictReader(raw_in))

    # contest.json
    contest_data = {
        'title': FLAGS.title.decode('utf-8'),
        'times': {
            'start': FLAGS.start_time,
            'freeze': FLAGS.freeze_time,
            'end': FLAGS.end_time,
        },
        'problems': problems,
    }
    with open(os.path.join(FLAGS.output_dir, 'contest.json'), 'w') as f:
        json.dump(contest_data, f, indent=2, sort_keys=True)

    # teams.json
    teams_data = {
        team['id']: {
            'id': team['id'],
            'name': team['name'],
            'university': team['university'],
            'country': team['country'],
            'members': [{
                'name': 'Member %d' % (i + 1),
                'icon': '/images/default-icon.png',
                'comment': '',
                'atcoderId': '',
                'codeforcesId': '',
                'githubId': '',
                'topcoderId': '',
                'twitterId': '',
            } for i in xrange(3 if FLAGS.enable_members else 0)],
            'photo': '/images/default-photo-regional.png',
        }
        for team in teams
    }
    with open(os.path.join(FLAGS.output_dir, 'teams.json'), 'w') as f:
        json.dump(teams_data, f, indent=2, sort_keys=True)

    # standings.json
    standings_data = [{
        'rank': 1,
        'teamId': team['id'],
        'solved': 0,
        'penalty': 0,
        'problems': [{
            'solved': False,
            'attempts': 0,
            'pendings': 0,
            'penalty': 0,
        } for _ in problems],
    } for team in sorted(teams, key=lambda t: (t['university'], t['name']))]
    with open(os.path.join(FLAGS.output_dir, 'standings.json'), 'w') as f:
        json.dump(standings_data, f, indent=2, sort_keys=True)

    # auth.json
    if not FLAGS.enable_members:
        auth_data = {}
    else:
        auth_data = {
            team['id']: sha256_crypt.encrypt(team['password_web'], rounds=1000)
            for team in teams
        }
    with open(os.path.join(FLAGS.output_dir, 'auth.json'), 'w') as f:
        json.dump(auth_data, f, indent=2, sort_keys=True)


if __name__ == '__main__':
    sys.exit(main(FLAGS(sys.argv)))
