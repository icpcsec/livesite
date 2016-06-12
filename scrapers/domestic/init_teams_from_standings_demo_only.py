#!/usr/bin/python
# -*- coding: utf-8 -*-

import json
import logging
import sys

import bs4
import gflags
import requests

FLAGS = gflags.FLAGS

gflags.DEFINE_string('scoreboard_url', None, 'Real scoreboard URL.')
gflags.DEFINE_string('livesite_url', None, 'Livesite URL.')
gflags.DEFINE_string('api_key', None, 'API key of livesite.')
gflags.MarkFlagAsRequired('scoreboard_url')
gflags.MarkFlagAsRequired('livesite_url')
gflags.MarkFlagAsRequired('api_key')


TEAM_COLUMNS = ('', 'id', 'name', 'university', '', '')


def fetch_standings():
  response = requests.get(FLAGS.scoreboard_url, timeout=10)
  response.raise_for_status()
  return response.text


def parse_standings(html):
  doc = bs4.BeautifulSoup(html, 'html5lib')
  teams = []
  mains = doc.select('.main')
  if not mains:
    return []
  table = mains[-1].table
  if table:
    for tr in table.select('tr'):
      row = [td.get_text().strip() for td in tr.select('td')]
      if row[0] == 'rank':
        continue
      team = dict(zip(TEAM_COLUMNS, row))
      team.pop('', None)
      teams.append(team)
  return teams


def main(unused_argv):
  html = fetch_standings()
  teams = parse_standings(html)
  if not teams:
    logging.error('Failed to parse the standings HTML!')
    return
  for team in teams:
    team['photo'] = '/images/default-photo.png'
    team['members'] = [
      {
        'name': u'メンバー%d' % (i + 1),
        'icon': '/images/default-icon.png',
        'comment': '',
        'codeforcesId': '',
        'githubId': '',
        'topcoderId': '',
        'twitterId': ''
      }
      for i in xrange(3)
    ]
  teams_map = {team['id']: team for team in teams}

  print 'Replacing with %d teams.' % len(teams_map)
  if raw_input('Are you really sure? ').strip().lower() != 'yes':
    return 'aborted.'

  update = {'$set': {'': teams_map}}
  data = {
      'api_key': FLAGS.api_key,
      'update': json.dumps(update),
  }
  response = requests.post(
    '%s/api/admin/update/teams' % FLAGS.livesite_url,
    data=data)
  response.raise_for_status()



if __name__ == '__main__':
  sys.exit(main(FLAGS(sys.argv)))
