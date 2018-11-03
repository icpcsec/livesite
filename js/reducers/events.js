const makeEntryMap = (entries) => {
  const entryMap = {};
  for (const entry of entries) {
    entryMap[entry.teamId] = entry;
  }
  return entryMap;
};

const computeEvents = (newEntries, oldEntries, teams, events = []) => {
  if (teams.length === 0 || oldEntries.length === 0 || newEntries.length === 0) {
    return events;
  }

  const now = new Date().getTime() / 1000;

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
    for (let problemIndex = 0; problemIndex < newProblems.length; ++problemIndex) {
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
        for (let attemptIndex = oldProblem.attempts; attemptIndex < newProblem.attempts; ++attemptIndex) {
          newEvents.push({
            eventId: `${now}.${teamId}.${problemIndex}.reject.${attemptIndex}`,
            time: now,
            type: 'rejected',
            teamId,
            problemIndex: problemIndex,
          });
        }
        for (let pendingIndex = oldProblem.pendings; pendingIndex < newProblem.pendings; ++pendingIndex) {
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
  return [].concat(events, newEvents);
};

export const deriveEvents = (reducer) => (state, action) => {
  const midState = Object.assign({}, state);
  delete midState.events;
  const newState = reducer(midState, action);
  const oldEntries = (state.standings || {entries: []}).entries;
  const newEntries = newState.standings.entries;
  return Object.assign(
      {},
      newState,
      {events: computeEvents(newEntries, oldEntries, newState.teams, state.events)});
};
