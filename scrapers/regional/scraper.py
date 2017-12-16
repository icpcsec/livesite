import csv
import datetime
import hashlib
import json
import logging
import logging.handlers
import os
import re
import sys
import time

import apscheduler.scheduler
import bs4
import colorlog
import gflags
import requests
import requests.exceptions

FLAGS = gflags.FLAGS

gflags.DEFINE_string('source_domjudge_url', None, '')
gflags.DEFINE_string('livesite_url', None, 'Livesite URL')
gflags.DEFINE_string('api_key', None, 'API key')
gflags.DEFINE_string('history_dir', None, 'The path to historical data.')
gflags.DEFINE_integer('sync_interval', None, 'Sync interval in seconds.')
gflags.DEFINE_bool('logtostderr', True, 'Log to stderr.')
gflags.DEFINE_bool('logtosyslog', True, 'Log to syslog.')
gflags.MarkFlagAsRequired('source_domjudge_url')
gflags.MarkFlagAsRequired('livesite_url')
gflags.MarkFlagAsRequired('api_key')
gflags.MarkFlagAsRequired('history_dir')
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
            'DEBUG':        'gray',
            'WARNING':    'yellow',
            'ERROR':        'red',
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
    response = requests.get(FLAGS.source_domjudge_url, timeout=10)
    return response.text


def parse_standings(html):
    doc = bs4.BeautifulSoup(html, 'html5lib')
    scoreboard_elem = doc.select('table.scoreboard')[0]
    out_teams = []
    last_rank = 1
    for team_elem in scoreboard_elem.select('tbody:nth-of-type(1) tr'):
        out_team_problems = []
        for problem_elem in team_elem.select('td')[5:]:
            text = problem_elem.get_text().strip()
            m = re.search(r'^(\d+)/(\d+)$', text)
            if m:
                attempts, penalty1 = map(int, m.groups())
                pendings = 0
                penalty = penalty1 # - 20 * (attempts - 1)
            else:
                m = re.search(r'^(\d+) \+ (\d+)$', text)
                if m:
                    attempts, pendings = map(int, m.groups())
                    penalty = 0
                else:
                    attempts = int(text)
                    pendings = 0
                    penalty = 0
            classes = problem_elem['class']
            solved = 'score_correct' in classes
            out_team_problems.append({
                'attempts': attempts,
                'pendings': pendings,
                'penalty': penalty,
                'solved': solved,
            })
        rank = team_elem.select('.scorepl')[0].get_text().strip()
        if rank:
            last_rank = rank = int(rank)
        else:
            rank = last_rank
        name_university = team_elem.select('.scoretn')[0].get_text().strip()
        tid = int(name_university.split(':', 1)[0], 10)
        solved = int(team_elem.select('.scorenc')[0].get_text().strip())
        penalty = int(team_elem.select('.scorett')[0].get_text().strip())
        out_teams.append({
            'teamId': tid,
            'rank': rank,
            'solved': solved,
            'penalty': penalty,
            'problems': out_team_problems,
        })
    return out_teams


def upload_standings_json(standings):
    logging.info('Uploading standings.json to %s', FLAGS.livesite_url)
    data = {
        'api_key': FLAGS.api_key,
        'update': json_dump({'$set': {'': standings}}),
    }
    r = requests.post(
        '%s/api/admin/update/standings' % FLAGS.livesite_url,
        data=data,
        timeout=5)
    r.raise_for_status()


class SyncJob(object):
    def __init__(self):
        self._last_hash = None

    def __call__(self):
        timestamp = int(time.time())
        logging.info('Timestamp: %d', timestamp)
        try:
            html = fetch_standings()
        except requests.exceptions.Timeout:
            logging.error('Fetch timeout.')
            return
        with open(os.path.join(FLAGS.history_dir, 'standings.%d.html' % timestamp), 'w') as out:
            out.write(html.encode('utf-8'))
        standings = parse_standings(html)
        if not standings:
            logging.error('Failed to parse the standings HTML!')
            return
        current_hash = hashlib.sha256(json_dump(standings)).hexdigest()
        with open(os.path.join(FLAGS.history_dir, 'standings.%d.json' % timestamp), 'w') as out:
            out.write(json_dump(standings))
        if current_hash != self._last_hash:
            upload_standings_json(standings)
            self._last_hash = current_hash
        else:
            logging.info('No update.')


def main(unused_argv):
    setup_logging()

    try:
        os.makedirs(FLAGS.history_dir)
    except OSError:
        pass

    sched = apscheduler.scheduler.Scheduler(standalone=True)
    sched.add_interval_job(
        SyncJob(),
        seconds=FLAGS.sync_interval,
        start_date=datetime.datetime.now() + datetime.timedelta(seconds=3))
    sched.start()


if __name__ == '__main__':
    sys.exit(main(FLAGS(sys.argv)))
