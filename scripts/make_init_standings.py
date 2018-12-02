#!/usr/bin/python
# -*- coding: utf-8 -*-

import json
import sys

teams = json.load(sys.stdin)

entries = []
for t in teams.values():
    entries.append({
        'rank': '-',
        'teamId': t['id'],
        'solved': 0,
        'penalty': 0,
    })

entries.sort(key=lambda e: int(e['teamId']))

standings = {
    'entries': entries,
    'problems': [
        {'color':'#ffa500','color_text':'orange','label':'A','name':'Problem A'},
        {'color':'#add8e6','color_text':'lightblue','label':'B','name':'Problem B'},
        {'color':'#90ee90','color_text':'lightgreen','label':'C','name':'Problem C'},
    ],
}

json.dump(standings, sys.stdout, separators=(',', ':'), sort_keys=True)
