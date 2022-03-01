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

import { Reducer } from 'redux';
import { AppNormalizedState, AppState } from '.';
import { ContestTimes, Event, StandingsEntry } from '../data';
import { AppAction } from '../actions';

export type EventsState = Event[];

function normalizeState(
  state: AppState | undefined
): AppNormalizedState | undefined {
  if (state === undefined) {
    return undefined;
  }
  const { events: _, ...normalizedState } = state;
  return normalizedState;
}

function makeEntryMap(
  entries: StandingsEntry[]
): Record<string, StandingsEntry> {
  const entryMap: Record<string, StandingsEntry> = {};
  for (const entry of entries) {
    entryMap[entry.teamId] = entry;
  }
  return entryMap;
}

function computeEvents(
  newEntries: StandingsEntry[],
  oldEntries: StandingsEntry[],
  times: ContestTimes,
  events: EventsState = []
): EventsState {
  if (oldEntries.length === 0 || newEntries.length === 0) {
    return events;
  }

  const now = new Date().getTime() / 1000;

  const freezeTime = times.freeze || 0;

  const newEvents: Event[] = [];

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
  return ([] as Event[]).concat(events, newEvents);
}

export function deriveEvents(
  reducer: Reducer<AppNormalizedState, AppAction>
): Reducer<AppState, AppAction> {
  return (state: AppState | undefined, action: AppAction) => {
    const newState = reducer(normalizeState(state), action);
    const oldEntries = state?.feeds?.standings?.entries ?? [];
    const newEntries = newState.feeds.standings.entries;
    const newTimes = newState.feeds.contest.times;
    const oldEvents = state?.events ?? [];
    return {
      ...newState,
      events: computeEvents(newEntries, oldEntries, newTimes, oldEvents),
    };
  };
}
