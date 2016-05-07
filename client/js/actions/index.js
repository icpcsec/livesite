export const updateContest = (contest) => (
  {
    type: 'UPDATE_CONTEST',
    contest,
  }
);

export const updateStandings = (standings) => (
  {
    type: 'UPDATE_STANDINGS',
    standings,
  }
);

export const updateTeams = (teams) => (
  {
    type: 'UPDATE_TEAMS',
    teams,
  }
);

export const markLoaded = (feed) => (
  {
    type: 'MARK_LOADED',
    feed,
  }
);
