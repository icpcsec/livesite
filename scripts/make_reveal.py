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


def recompute_entries(entries):
    for entry in entries:
        entry['solved'] = len([p for p in entry['problems'] if p['solved']])
        entry['penalty'] = sum([
            p['penalty'] + 20 * (p['attempts'] - 1) for p in entry['problems']
            if p['solved']
        ])
    entries.sort(key=lambda entry: (-entry['solved'], entry['penalty']))
    for i, entry in enumerate(entries):
        entry['rank'] = i + 1


def check_entries_equals(entries1, entries2):
    if entries1 == entries2:
        return
    for i, (entry1, entry2) in enumerate(zip(entries1, entries2)):
        if entry1 != entry2:
            print 'ERROR: standings mismatch at rank %d' % (i + 1)
            print entry1
            print entry2


def main(unused_argv):
    with open(FLAGS.frozen_standings) as f:
        standings_start = json.load(f)
    with open(FLAGS.final_standings) as f:
        standings_end = json.load(f)

    assert standings_start['problems'] == standings_end['problems']
    all_problems = standings_start['problems']

    entries_start = standings_start['entries']
    entries_end = standings_end['entries']

    for entry in entries_start:
        entry['revealState'] = 'pending'
    for entry in entries_end:
        entry['revealState'] = 'finalized'

    final_map = {}
    for entry in entries_end:
        for i, problem in enumerate(entry['problems']):
            final_map[(entry['teamId'], i)] = problem

    def reveal_step():
        for entry in reversed(entries):
            if entry['revealState'] == 'finalized':
                continue
            for i, problem in enumerate(entry['problems']):
                if problem['pendings'] > 0:
                    problem.clear()
                    problem.update(final_map[(entry['teamId'], i)])
                    return True
            entry['revealState'] = 'finalized'
            return True
        return False

    entries = copy.deepcopy(entries_start)
    recompute_entries(entries)
    check_entries_equals(entries, entries_start)

    entries_list = [copy.deepcopy(entries)]
    while reveal_step():
        recompute_entries(entries)
        entries_list.append(copy.deepcopy(entries))
        sys.stdout.write('.')
        sys.stdout.flush()
    sys.stdout.write('\n')
    sys.stdout.flush()

    check_entries_equals(entries, entries_end)

    data = {
        'entriesList': entries_list,
        'problems': all_problems,
    }

    with open(FLAGS.output_json, 'w') as f:
        json.dump(data, f, sort_keys=True, separators=(',', ':'))


if __name__ == '__main__':
    sys.exit(main(FLAGS(sys.argv)))
