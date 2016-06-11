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

export const updateRatings = (ratings) => (
  {
    type: 'UPDATE_RATINGS',
    ratings,
  }
);

export const markLoaded = (feed) => (
  {
    type: 'MARK_LOADED',
    feed,
  }
);

export const updateSettings = (settings) => (
  {
    type: 'UPDATE_SETTINGS',
    settings,
  }
);
