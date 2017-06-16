#!/usr/bin/python
# -*- coding: utf-8 -*-

import csv
import json
import sys

in_teams = list(csv.DictReader(open('teams-conf.csv')))
in_teams.sort(key=lambda t: t['team'])

standings = []
for t in in_teams:
  standings.append({
    'rank': '-',
    'teamId': t['baylor_id'],
    'solved': 0,
    'penalty': 0,
  })

with open('standings.json', 'w') as f:
  json.dump(standings, f)
