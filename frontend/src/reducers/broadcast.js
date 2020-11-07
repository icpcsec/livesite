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
  signedIn: false,
  view: 'none',
};

function broadcast(state = DEFAULT, action) {
  if (action.type === 'UPDATE_BROADCAST') {
    state = applyPartialUpdate(state, action.update);
  }
  return state;
}

export default broadcast;
