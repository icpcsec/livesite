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


TEAM_COLUMNS = ('rank', 'teamId', '', '', 'solved', 'penalty')

COLORS = (
    '#F44336',  # red
    '#4CAF50',  # green
    '#EAD61E',  # yellow
    '#3F51B5',  # blue
    '#F48FB1',  # pink
    '#FF9800',  # orange
    '#81D4FA',  # cyan
    '#E040FB',  # purple
    '#76FF03',  # light green
    '#FFFFFF',  # white
    '#000000',  # black
)


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
  problems = []
  teams = []
  mains = doc.select('.main')
  if not mains:
    return [], []
  table = mains[-1].table
  if table:
    for tr in table.select('tr'):
      row = [td.get_text().strip() for td in tr.select('td')]
      if row[0] == 'rank':
        for label, color in zip(row[6:], COLORS):
          problems.append({
              'label': label,
              'name': 'Problem %s' % label,
              'color': color,
          })
        continue
      team = dict(zip(TEAM_COLUMNS, row))
      team.pop('', None)
      team['problems'] = [{'solved': (value == 'SOLVED')} for value in row[6:]]
      real_team_id = team_id_map.get(team['teamId'])
      if not real_team_id:
        logging.warning('Dropping team %s', team['teamId'])
      else:
        team['teamId'] = real_team_id
        teams.append(team)
  return problems, teams


def upload_problems_json(problems):
  logging.info('Uploading problems.json to %s', FLAGS.livesite_url)
  data = {
      'api_key': FLAGS.api_key,
      'update': json_dump({'$set': {'problems': problems}}),
  }
  response = requests.post(
      '%s/api/admin/update/contest' % FLAGS.livesite_url,
      data=data,
      timeout=10)
  response.raise_for_status()


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
    self._last_problems = None

  def __call__(self):
    timestamp = int(time.time())
    logging.info('Timestamp: %d', timestamp)
    html = fetch_standings()
    with open(os.path.join(FLAGS.log_dir, 'standings.%d.html' % timestamp), 'w') as out:
      out.write(html.encode('utf-8'))
    problems, teams = parse_standings(html, self._team_id_map)
    if not teams:
      logging.error('Failed to parse the standings HTML!')
      return
    if problems != self._last_problems:
      upload_problems_json(problems)
      self._last_problems = problems
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
