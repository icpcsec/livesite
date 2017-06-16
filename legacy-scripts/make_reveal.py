#!/usr/bin/python

import copy
import json
import os
import subprocess
import sys

import gflags

FLAGS = gflags.FLAGS

gflags.DEFINE_string('frozen_standings', None, '')
gflags.DEFINE_string('final_standings', None, '')
gflags.DEFINE_string('output_json', None, '')
gflags.MarkFlagAsRequired('frozen_standings')
gflags.MarkFlagAsRequired('final_standings')
gflags.MarkFlagAsRequired('output_json')


def recompute_standings(standings):
    for status in standings:
        status['solved'] = len([p for p in status['problems'] if p['solved']])
        status['penalty'] = sum([p['penalty'] + 20 * (p['attempts'] - 1) for p in status['problems'] if p['solved']])
    standings.sort(key=lambda status: (-status['solved'], status['penalty']))
    for i, status in enumerate(standings):
        status['rank'] = i + 1


def check_standings_equals(standings1, standings2):
    if standings1 == standings2:
        return
    for i, (status1, status2) in enumerate(zip(standings1, standings2)):
        if status1 != status2:
            print 'ERROR: standings mismatch at rank %d' % (i + 1)
            print status1
            print status2


def main(unused_argv):
    with open(FLAGS.frozen_standings) as f:
        standings_start = json.load(f)
    with open(FLAGS.final_standings) as f:
        standings_end = json.load(f)

    for status in standings_start:
        status['revealState'] = 'pending'
    for status in standings_end:
        status['revealState'] = 'finalized'

    final_map = {}
    for status in standings_end:
        for i, problem in enumerate(status['problems']):
            final_map[(status['teamId'], i)] = problem

    def reveal_step():
        for status in reversed(standings):
            if status['revealState'] == 'finalized':
                continue
            for i, problem in enumerate(status['problems']):
                if problem['pendings'] > 0:
                    problem.clear()
                    problem.update(final_map[(status['teamId'], i)])
                    return True
            status['revealState'] = 'finalized'
            return True
        return False

    standings = copy.deepcopy(standings_start)
    recompute_standings(standings)
    check_standings_equals(standings, standings_start)

    standings_list = [copy.deepcopy(standings)]
    while reveal_step():
        recompute_standings(standings)
        standings_list.append(copy.deepcopy(standings))
        sys.stdout.write('.')
        sys.stdout.flush()
    sys.stdout.write('\n')
    sys.stdout.flush()

    check_standings_equals(standings, standings_end)

    data = {
        'reveal': standings_list,
    }

    with open(FLAGS.output_json, 'w') as f:
        json.dump(data, f, sort_keys=True)


if __name__ == '__main__':
    sys.exit(main(FLAGS(sys.argv)))
