#!/usr/bin/python3

import csv
import json
import sys


def main():
    teams = csv.DictReader(sys.stdin)

    entries = {}
    for team in teams:
        id = int(team['id'])
        if id <= 0 or id >= 90:
            continue

        entries[str(id)] = {
            'name': team['name'],
            'university': team['university'],
            'universityEn': team['university'],
            'members': []
        }

    json.dump(entries, sys.stdout, indent=2)

if __name__ == '__main__':
    main()
