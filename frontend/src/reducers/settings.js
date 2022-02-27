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

import applyPartialUpdate from 'immutability-helper';

function updateSettings(settings) {
  if (settings.version === undefined) {
    const serialized = localStorage.getItem('settings');
    if (serialized) {
      try {
        settings = JSON.parse(serialized);
      } catch (e) {
        // Ignore corrupted settings.
      }
    }
    if (settings.version === undefined) {
      settings = { version: 0 };
    }
  }
  if (settings.version < 1) {
    settings = applyPartialUpdate(settings, {
      version: { $set: 1 },
      pinnedTeamIds: { $set: [] },
    });
  }
  if (settings.version < 2) {
    settings = applyPartialUpdate(settings, {
      version: { $set: 2 },
      invertColor: { $set: false },
      autoscroll: { $set: false },
    });
  }
  return settings;
}

function settings(settings = {}, action) {
  settings = updateSettings(settings);
  if (action.type === 'UPDATE_SETTINGS') {
    settings = applyPartialUpdate(settings, action.settingsUpdate);
  }
  if (action.type === 'TOGGLE_SETTING') {
    settings = applyPartialUpdate(settings, {
      [action.name]: { $set: !settings[action.name] },
    });
  }
  return settings;
}

export default settings;
