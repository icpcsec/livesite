export const updateFeeds = (update) => (
  {
    type: 'UPDATE_FEEDS',
    update,
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

export const setRevealStandingsIndex = (index) => (
  {
    type: 'SET_REVEAL_STANDINGS_INDEX',
    index,
  }
);

export const setRevealStandingsList = (standingsList) => (
  {
    type: 'SET_REVEAL_STANDINGS_LIST',
    standingsList,
  }
);
