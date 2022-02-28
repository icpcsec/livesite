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
import { AppAction } from '../redux';

export type SettingsState = {
  version: number;
  pinnedTeamIds: string[];
  invertColor: boolean;
  autoscroll: boolean;
};

const DEFAULT: SettingsState = {
  version: 1,
  pinnedTeamIds: [],
  invertColor: false,
  autoscroll: false,
};

function migrateSettings(settings: SettingsState): SettingsState {
  return settings;
}

function settings(settings = DEFAULT, action: AppAction): SettingsState {
  settings = migrateSettings(settings);
  if (action.type === 'UPDATE_SETTINGS') {
    settings = applyPartialUpdate(settings, action.settingsUpdate);
  }
  if (action.type === 'TOGGLE_SETTING') {
    settings = applyPartialUpdate(settings, {
      [action.name]: { $set: !settings[action.name as keyof typeof settings] },
    });
  }
  return settings;
}

export default settings;
