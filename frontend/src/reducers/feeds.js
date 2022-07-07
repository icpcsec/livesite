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

const DEFAULT = {
  contest: {
    title: null,
    times: null,
  },
  standings: {
    problems: [],
    entries: [],
  },
  teams: {},
  loaded: new Set(),
};

function feeds(state = DEFAULT, action) {
  if (action.type === 'UPDATE_FEEDS') {
    state = applyPartialUpdate(state, action.update);
    const newLoaded = new Set(state.loaded);
    for (const name in action.update) {
      if (action.update.hasOwnProperty(name)) {
        newLoaded.add(name);
      }
    }
    state = applyPartialUpdate(state, { loaded: { $set: newLoaded } });
  }
  return state;
}

export default feeds;
