#!/usr/bin/python

import csv
import datetime
import hashlib
import json
import logging
import logging.handlers
import os
import sys
import time

import apscheduler.scheduler
import bs4
import colorlog
import gflags
import requests
import requests.exceptions

FLAGS = gflags.FLAGS

gflags.DEFINE_string('scoreboard_url', None, 'Real scoreboard URL.')
gflags.DEFINE_string('livesite_url', None, 'Livesite URL.')
gflags.DEFINE_string('teams_csv', None, 'The path to teams.csv.')
gflags.DEFINE_string('api_key', None, 'API key of livesite.')
gflags.DEFINE_string('log_dir', None, 'The path to log data directory.')
gflags.DEFINE_integer('sync_interval', None, 'Sync interval in seconds.')
gflags.DEFINE_bool('logtostderr', True, 'Log to stderr.')
gflags.DEFINE_bool('logtosyslog', True, 'Log to syslog.')
gflags.MarkFlagAsRequired('scoreboard_url')
gflags.MarkFlagAsRequired('livesite_url')
gflags.MarkFlagAsRequired('teams_csv')
gflags.MarkFlagAsRequired('api_key')
gflags.MarkFlagAsRequired('log_dir')
gflags.MarkFlagAsRequired('sync_interval')


def setup_logging():
  root = logging.getLogger()
  root.setLevel(logging.INFO)
  formatter = logging.Formatter(
    '%(asctime)-15s %(levelname)s [%(filename)s:%(lineno)d] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S')
  color_formatter = colorlog.ColoredFormatter(
    '%(log_color)s%(asctime)-15s %(levelname)s [%(filename)s:%(lineno)d] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    reset=True,
    log_colors={
      'DEBUG':    'gray',
      'WARNING':  'yellow',
      'ERROR':    'red',
      'CRITICAL': 'red',
      })
  if FLAGS.logtostderr:
    handler = logging.StreamHandler(sys.stderr)
    handler.setFormatter(color_formatter)
    root.addHandler(handler)
  if FLAGS.logtosyslog:
    handler = logging.handlers.SysLogHandler('/dev/log')
    handler.setFormatter(formatter)
    root.addHandler(handler)


def json_dump(data):
  return json.dumps(data, sort_keys=True, separators=(',', ':'))


def fetch_standings():
  response = requests.get(FLAGS.scoreboard_url, timeout=10)
  response.raise_for_status()
  return response.text


def parse_standings(html, team_id_map):
  doc = bs4.BeautifulSoup(html, 'html5lib')
  teams = []
  tables = doc.select('table')
  if not tables:
    return []
  table = tables[-1]
  if table:
    for tr in table.select('tr'):
      row = [td.get_text().strip() for td in tr.select('td')]
      if not row or row[0] == 'rank':
        continue
      private_team_id = row[2]
      if int(private_team_id) < 0:
        # skip internal teams
        continue
      public_team_id = team_id_map.get(private_team_id)
      rank = row[0] if int(row[-2]) > 0 else '-'
      problems = []
      for c in row[5:-2]:
        if c.endswith(')'):
          l, r = c.rstrip(')').split('(')
          attempts = int(r)
          c = l.strip()
        else:
          attempts = 0
        if c.startswith('-'):
          penalty = 0
          solved = False
        else:
          penalty = int(c)
          solved = True
        problems.append({
          'attempts': attempts,
          'pendings': 0,  # TODO: Maybe we can get this
          'penalty': penalty,
          'solved': solved,
        })
      team = {
        'teamId': public_team_id,
        'rank': rank,
        'solved': int(row[-2]),
        'penalty': int(row[-1]),
        'problems': problems,
      }
      teams.append(team)
  return teams


def upload_standings_json(teams):
  logging.info('Uploading standings.json to %s', FLAGS.livesite_url)
  data = {
      'api_key': FLAGS.api_key,
      'update': json_dump({'$set': {'': teams}}),
  }
  response = requests.post(
      '%s/api/admin/update/standings' % FLAGS.livesite_url,
      data=data,
      timeout=10)
  response.raise_for_status()


class SyncJob(object):
  def __init__(self, team_id_map):
    self._team_id_map = team_id_map
    self._last_hash = None

  def __call__(self):
    timestamp = int(time.time())
    logging.info('Timestamp: %d', timestamp)
    html = fetch_standings()
    with open(os.path.join(FLAGS.log_dir, 'standings.%d.html' % timestamp), 'w') as out:
      out.write(html.encode('utf-8'))
    teams = parse_standings(html, self._team_id_map)
    if not teams:
      logging.error('Failed to parse the standings HTML!')
      return
    current_hash = hashlib.sha256(json_dump(teams)).hexdigest()
    with open(os.path.join(FLAGS.log_dir, 'standings.%d.json' % timestamp), 'w') as out:
      out.write(json_dump(teams))
    if current_hash != self._last_hash:
      upload_standings_json(teams)
      self._last_hash = current_hash
    else:
      logging.info('No update.')


def main(unused_argv):
  setup_logging()

  try:
    os.makedirs(FLAGS.log_dir)
  except OSError:
    pass

  with open(FLAGS.teams_csv) as f:
    rows = csv.DictReader(f)
    team_id_map = {row['private_id']: row['public_id'] for row in rows}

  sched = apscheduler.scheduler.Scheduler(standalone=True)
  sched.add_interval_job(
    SyncJob(team_id_map),
    seconds=FLAGS.sync_interval,
    start_date=datetime.datetime.now() + datetime.timedelta(seconds=3))
  sched.start()


if __name__ == '__main__':
  sys.exit(main(FLAGS(sys.argv)))
