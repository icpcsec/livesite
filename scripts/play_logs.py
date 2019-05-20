#!/usr/bin/python3
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

import http.server as http_server
import json
import os
import re
import sys
import threading
import time

import requests

SCALE = 60
STRIDE = 30

URL_PREFIX = 'http://localhost:5002'
STANDINGS_JSON_RE = re.compile(r'^standings\.(\d+)\.json$')


class Handler(http_server.SimpleHTTPRequestHandler):
    def send_response(self, code, message=None):
        super().send_response(code, message)
        self.send_header('Access-Control-Allow-Origin', '*')


def run_server():
    server = http_server.HTTPServer(('localhost', 5002), Handler)
    server.serve_forever()


def main(argv):
    basedir, = argv[1:]
    os.chdir(basedir)

    threading.Thread(target=run_server, daemon=True).start()
    time.sleep(1)

    session = requests.Session()

    with open('contest.json', 'r') as f:
        contest = json.load(f)

    times = contest['times']
    start_time = times['start']

    init_time = int(time.time())
    new_start_time = init_time + 3
    new_end_time = (times['end'] - times['start']) // SCALE + new_start_time
    new_freeze_time = (times['freeze'] - times['start']) // SCALE + new_start_time
    new_times = {
        'start': new_start_time,
        'end': new_end_time,
        'freeze': new_freeze_time,
        'scale': SCALE,
    }

    contest['times'] = new_times

    contest_json_name = 'contest.%d.json' % init_time
    with open(contest_json_name, 'w') as f:
        json.dump(contest, f, indent=2, sort_keys=True)

    print(contest_json_name, file=sys.stderr)
    session.put('http://localhost:5001/feeds/contest.json',
                json=('%s/%s' % (URL_PREFIX, contest_json_name)))

    print('teams.json', file=sys.stderr)
    session.put('http://localhost:5001/feeds/teams.json',
                json=('%s/%s' % (URL_PREFIX, 'teams.json')))

    standings_series = []
    for name in os.listdir('.'):
        m = STANDINGS_JSON_RE.search(name)
        if not m:
            continue
        ts = int(m.group(1))
        if ts < start_time:
            continue
        standings_series.append((ts, name))

    standings_series.sort()
    last_standings = standings_series[-1]
    standings_series = standings_series[0::STRIDE]
    if standings_series[-1] != last_standings:
        standings_series.append(last_standings)

    print(standings_series[0][1], file=sys.stderr)
    session.put('http://localhost:5001/feeds/standings.json',
                json=('%s/%s' % (URL_PREFIX, standings_series[0][1])))

    for record_time, name in standings_series[1:]:
        new_play_time = (record_time - start_time) / SCALE + new_start_time
        delta_time = new_play_time - time.time()
        if delta_time > 0:
            time.sleep(delta_time)
        else:
            print('warning: behind', file=sys.stderr)
        print(name, file=sys.stderr)
        done = False
        while not done:
            try:
                session.put('http://localhost:5001/feeds/standings.json',
                            json=('%s/%s' % (URL_PREFIX, name)))
            except Exception:
                print('warning: retry', file=sys.stderr)
            else:
                done = True

    print('finished')
    time.sleep(10000000)


if __name__ == '__main__':
    main(sys.argv)
