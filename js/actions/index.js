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
