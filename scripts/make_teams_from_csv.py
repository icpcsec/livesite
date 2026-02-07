#!/usr/bin/python3

import csv
import json
import sys


def main():
    teams = csv.DictReader(sys.stdin)

    entries = {}
    for team in teams:
        if team['category'] != 'Participants':
            continue

        entries[team['id']] = {
            'name': team['teamname'],
            'university': team['affiliation'],
            'universityEn': team['affiliation'],
            'members': [],
            'photo': '/images/default-photo-regional.png',
        }

    json.dump(entries, sys.stdout, indent=2)

if __name__ == '__main__':
    main()
