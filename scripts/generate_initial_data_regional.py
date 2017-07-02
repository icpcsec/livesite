#!/usr/bin/python

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


def main(unused_argv):
    teams = []
    with open(FLAGS.teams_csv) as raw_in:
        csv_in = csv.DictReader(raw_in)
        for team in csv_in:
            for key in team:
                team[key] = team[key].decode('utf-8')
            if team['password_web'] not in ('', '-'):
                teams.append(team)

    # contest.json
    contest_data = {
        'title': FLAGS.title.decode('utf-8'),
        'times': {
            'start': FLAGS.start_time,
            'freeze': FLAGS.freeze_time,
            'end': FLAGS.end_time,
        },
        'problems': [
            {
                'color': '#ff0000',
                'name': 'Problem A',
                'label': 'A',
            },
            {
                'color': '#00ff00',
                'name': 'Problem B',
                'label': 'B',
            },
            {
                'color': '#0000ff',
                'name': 'Problem C',
                'label': 'C',
            },
        ],
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
                'codeforcesId': '',
                'githubId': '',
                'topcoderId': '',
                'twitterId': '',
            } for i in xrange(3)],
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
        } for _ in xrange(3)],
    } for team in sorted(teams, key=lambda t: (t['university'], t['name']))]
    with open(os.path.join(FLAGS.output_dir, 'standings.json'), 'w') as f:
        json.dump(standings_data, f, indent=2, sort_keys=True)

    # auth.json
    auth_data = {
        team['id']: sha256_crypt.encrypt(team['password_web'], rounds=1000)
        for team in teams
    }
    with open(os.path.join(FLAGS.output_dir, 'auth.json'), 'w') as f:
        json.dump(auth_data, f, indent=2, sort_keys=True)


if __name__ == '__main__':
    sys.exit(main(FLAGS(sys.argv)))
