const makeStatusMap = (standings) => {
  const statusMap = {};
  for (const status of standings) {
    statusMap[status.teamId] = status;
  }
  return statusMap;
};

const computeEvents = (newStandings, oldStandings, teams, events = []) => {
  if (teams.length === 0 || oldStandings.length === 0 || newStandings.length === 0) {
    return events;
  }

  const now = new Date().getTime() / 1000;

  const newEvents = [];

  const oldStatusMap = makeStatusMap(oldStandings);
  const newStatusMap = makeStatusMap(newStandings);
  for (const teamId in newStatusMap) {
    if (!(teamId in oldStatusMap)) {
      continue;
    }
    const { problems: newProblems, rank: newRank } = newStatusMap[teamId];
    const { problems: oldProblems, rank: oldRank } = oldStatusMap[teamId];
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
            type: 'accept',
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
            type: 'reject',
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
  const newState = reducer(state, action);
  return Object.assign(
      {},
      newState,
      {events: computeEvents(newState.standings, state.standings, newState.teams, state.events)});
};
