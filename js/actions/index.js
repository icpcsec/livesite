export const updateFeeds = (update) => (
  {
    type: 'UPDATE_FEEDS',
    update,
  }
);

export const updateBroadcast = (update) => (
    {
      type: 'UPDATE_BROADCAST',
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

export const setRevealStep = (step) => (
  {
    type: 'SET_REVEAL_STEP',
    step,
  }
);

export const setRevealData = (reveal) => (
  {
    type: 'SET_REVEAL_DATA',
    reveal,
  }
);
