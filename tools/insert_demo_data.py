#!/usr/bin/python

import colorsys
import random
import sys

import bson.timestamp
import gflags
from passlib.hash import sha256_crypt

from livesite import model

FLAGS = gflags.FLAGS


def main(unused_argv):
  model.drop_db()

  contest = {
      'title': 'Demo Contest',
      'detailedStandings': False,
      'problems': [{
          'color': '#%02x%02x%02x' % tuple(
              int(v * 255) for v in colorsys.hsv_to_rgb(i / 10.0, 1, 1)),
           'label': chr(ord('A') + i),
          'name': 'Problem %s' % chr(ord('A') + i),
      } for i in xrange(10)],
  }

  model.replace_entity('contest', contest)

  team_map = {}
  for team_index in xrange(100):
    team_id = 't%d' % team_index
    team_map[team_id] = {
        'id': team_id,
        'name': 'Team %d' % team_index,
        'university': 'University of %d' % team_index,
        'photo': 'https://storage.googleapis.com/icpcsec/images/default-photo.png',
        'members': [{
            'name': 'Member %d' % (i + 1),
            'topcoderId': '',
            'codeforcesId': '',
            'twitterId': '',
            'githubId': '',
            'comment': '',
            'icon': 'https://storage.googleapis.com/icpcsec/images/default-icon.png',
        } for i in xrange(3)],
    }

  team_map['sample'] = {
      'id': 'sample',
      'name': 'Sample Team',
      'university': 'University of Sample',
      'photo': 'https://storage.googleapis.com/icpcsec/images/default-photo.png',
      'members': [{
          'name': 'Member %d' % (i + 1),
          'topcoderId': '',
          'codeforcesId': '',
          'twitterId': '',
          'githubId': '',
          'comment': '',
          'icon': 'https://storage.googleapis.com/icpcsec/images/default-icon.png',
      } for i in xrange(3)],
      'hidden': True,
  }

  model.replace_entity('teams', team_map)

  auth_map = {}
  fixed_hash = sha256_crypt.encrypt('hogehoge')
  for team_index in xrange(100):
    team_id = 't%d' % team_index
    auth_map[team_id] = fixed_hash
  auth_map['sample'] = fixed_hash

  model.replace_entity('auth', auth_map)

  standings = []
  for team_index in xrange(100):
    problems = []
    for _ in xrange(10):
      coin = random.randrange(30)
      if coin < 10:
        solved = True
        attempts = random.randrange(1, 4)
        pendings = 0
        penalty = random.randrange(300)
      elif coin < 12:
        solved = False
        attempts = random.randrange(1, 4)
        pendings = 0
        penalty = 0
      elif coin < 13:
        solved = False
        attempts = random.randrange(0, 4)
        pendings = 1
        penalty = 0
      else:
        solved = False
        attempts = 0
        pendings = 0
        penalty = 0
      problems.append({
        'solved': solved,
        'attempts': attempts,
        'pendings': pendings,
        'penalty': penalty,
      })
    status = {
        'teamId': 't%d' % team_index,
        'solved': sum(1 for p in problems if p['solved']),
        'penalty': sum(p['penalty'] + (p['attempts'] - 1) * 20 for p in problems if p['solved']),
        'problems': problems,
    }
    standings.append(status)

  standings.sort(key=lambda status: (-status['solved'], status['penalty']))
  for i, status in enumerate(standings):
    status['rank'] = i + 1

  model.replace_entity('standings', standings)

  model.replace_entity('initialized', True)


if __name__ == '__main__':
  sys.exit(main(FLAGS(sys.argv)))
