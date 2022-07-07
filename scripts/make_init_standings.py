#!/usr/bin/python
# -*- coding: utf-8 -*-
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

import json
import sys

teams = json.load(sys.stdin)

entries = []
for tid in teams.keys():
    entries.append({
        'rank': '-',
        'teamId': tid,
        'solved': 0,
        'penalty': 0,
        'problems': [{
            'solved': False,
            'attempts': 0,
            'penalty': 0,
            'pendings': 0,
        } for _ in range(3)]
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

json.dump(standings, sys.stdout, indent=2, sort_keys=True)
