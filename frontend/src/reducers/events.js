// Copyright 2019 LiveSite authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

function makeEntryMap(entries) {
  const entryMap = {};
  for (const entry of entries) {
    entryMap[entry.teamId] = entry;
  }
  return entryMap;
}

function computeEvents(newEntries, oldEntries, teams, times, events = []) {
  if (
    teams.length === 0 ||
    oldEntries.length === 0 ||
    newEntries.length === 0
  ) {
    return events;
  }

  const now = new Date().getTime() / 1000;

  const freezeTime = times.freeze || 0;

  const newEvents = [];

  const oldEntrymap = makeEntryMap(oldEntries);
  const newEntryMap = makeEntryMap(newEntries);
  for (const teamId in newEntryMap) {
    if (!(teamId in oldEntrymap)) {
      continue;
    }
    const { problems: newProblems, rank: newRank } = newEntryMap[teamId];
    const { problems: oldProblems, rank: oldRank } = oldEntrymap[teamId];
    if (oldProblems.length !== newProblems.length) {
      continue;
    }
    for (
      let problemIndex = 0;
      problemIndex < newProblems.length;
      ++problemIndex
    ) {
      const newProblem = newProblems[problemIndex];
      const oldProblem = oldProblems[problemIndex];
      if (newProblem.solved) {
        if (!oldProblem.solved) {
          newEvents.push({
            eventId: `${now}.${teamId}.${problemIndex}.accept`,
            time: now,
            type: 'solved',
            teamId,
            problemIndex: problemIndex,
            oldRank,
            newRank,
          });
        }
      } else {
        for (
          let attemptIndex = oldProblem.attempts;
          attemptIndex < newProblem.attempts;
          ++attemptIndex
        ) {
          newEvents.push({
            eventId: `${now}.${teamId}.${problemIndex}.reject.${attemptIndex}`,
            time: now,
            type: 'rejected',
            teamId,
            problemIndex: problemIndex,
          });
        }
        if (now >= freezeTime) {
          for (
            let pendingIndex = oldProblem.pendings;
            pendingIndex < newProblem.pendings;
            ++pendingIndex
          ) {
            newEvents.push({
              eventId: `${now}.${teamId}.${problemIndex}.pending.${pendingIndex}`,
              time: now,
              type: 'pending',
              teamId,
              problemIndex: problemIndex,
            });
          }
        }
      }
    }
  }
  return [].concat(events, newEvents);
}

export function deriveEvents(reducer) {
  return (state, action) => {
    const midState = Object.assign({}, state);
    delete midState.events;
    const newState = reducer(midState, action);
    const oldEntries = ((state.feeds || {}).standings || {}).entries || [];
    const newEntries = ((newState.feeds || {}).standings || {}).entries || [];
    const newTeams = newState.feeds.teams || {};
    const newTimes = (newState.feeds.contest || {}).times || {};
    const oldEvents = state.events || [];
    return Object.assign({}, newState, {
      events: computeEvents(
        newEntries,
        oldEntries,
        newTeams,
        newTimes,
        oldEvents
      ),
    });
  };
}
