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

class Persist {
  constructor() {
    this.lastSettings_ = undefined;
  }

  createReducer(reducer) {
    return (state, action) => {
      if (action.type === 'LOAD') {
        state = applyPartialUpdate(state, action.update);
      }
      return reducer(state, action);
    };
  }

  start(store) {
    if (!window.localStorage) {
      console.log('Local storage is unavailable. Settings are not persisted.');
      return;
    }
    const serialized = localStorage.getItem('settings');
    if (serialized) {
      try {
        const settings = JSON.parse(serialized);
        store.dispatch({
          type: 'LOAD',
          update: { settings: { $set: settings } },
        });
      } catch(e) {
        // Ignore corrupted settings.
      }
    }
    store.subscribe(() => this.onStateChanged(store));
  }

  onStateChanged(store) {
    const settings = store.getState().settings;
    if (settings !== this.lastSettings_) {
      const serialized = JSON.stringify(settings);
      try {
        localStorage.setItem('settings', serialized);
      } catch (e) {
        console.log('Failed to save settings to local storage.');
      }
      this.lastSettings_ = settings;
    }
  }
}

function createPersist() {
  return new Persist();
}

export { createPersist };
