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

import bs4
import gflags

FLAGS = gflags.FLAGS

gflags.DEFINE_string('standings_html', None, '')
gflags.DEFINE_string('teams_csv', None, 'Path to teams.csv.')
gflags.MarkFlagAsRequired('standings_html')
gflags.MarkFlagAsRequired('teams_csv')


def json_dump(data):
    return json.dumps(data, sort_keys=True, separators=(',', ':'))


def parse_standings(html, team_map):
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
        tid, name, university = team_map.get(name_university, (None, None, None))
        if tid is None:
            print >>sys.stderr, 'unknown name_university: %s' % name_university
            continue
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


def main(unused_argv):
    team_map = {}
    with open(FLAGS.teams_csv) as f:
        for row in csv.DictReader(f):
            team_map[(row['name'] + row['university'])] = (
                int(row['id']), row['name'], row['university'])

    with open(FLAGS.standings_html) as f:
        html = f.read()
    standings = parse_standings(html, team_map)
    print json_dump(standings)


if __name__ == '__main__':
    sys.exit(main(FLAGS(sys.argv)))
