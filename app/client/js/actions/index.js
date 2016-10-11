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

export const updateSettings = (settingsUpdate) => (
  {
    type: 'UPDATE_SETTINGS',
    settingsUpdate,
  }
);

export const toggleSetting = (name) => (dispatch, getState) => {
  const oldSettings = getState().settings;
  const settingsUpdate = {[name]: {$set: !oldSettings[name]}};
  dispatch(updateSettings(settingsUpdate));
};

export const showStreaming = (x, y) => (
  {
    type: 'SHOW_STREAMING',
    x,
    y,
  }
);

export const hideStreaming = () => (
  {
    type: 'HIDE_STREAMING',
  }
);
