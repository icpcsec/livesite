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

import { AllFeeds, StandingsHistory } from '../data';
import { BroadcastState } from '../reducers/broadcast';
import { SettingsState } from '../reducers/settings';
import { TopLevelUpdate } from '../utils';

export type UpdateFeeds = {
  type: 'UPDATE_FEEDS';
  update: TopLevelUpdate<AllFeeds>;
};

export function updateFeeds(update: TopLevelUpdate<AllFeeds>): UpdateFeeds {
  return {
    type: 'UPDATE_FEEDS',
    update,
  };
}

export type UpdateBroadcast = {
  type: 'UPDATE_BROADCAST';
  update: TopLevelUpdate<BroadcastState>;
};

export function updateBroadcast(
  update: TopLevelUpdate<BroadcastState>
): UpdateBroadcast {
  return {
    type: 'UPDATE_BROADCAST',
    update,
  };
}

export type UpdateSettings = {
  type: 'UPDATE_SETTINGS';
  settingsUpdate: TopLevelUpdate<SettingsState>;
};

export function updateSettings(
  settingsUpdate: TopLevelUpdate<SettingsState>
): UpdateSettings {
  return {
    type: 'UPDATE_SETTINGS',
    settingsUpdate,
  };
}

type FieldsOfType<T, V, K extends keyof T = keyof T> = K extends unknown
  ? T[K] extends V
    ? K
    : never
  : never;

export type BooleanSettings = FieldsOfType<SettingsState, boolean>;

export type ToggleSetting = {
  type: 'TOGGLE_SETTING';
  name: BooleanSettings;
};

export function toggleSetting(name: BooleanSettings): ToggleSetting {
  return {
    type: 'TOGGLE_SETTING',
    name,
  };
}

export type SetRevealStep = {
  type: 'SET_REVEAL_STEP';
  step: number;
};

export function setRevealStep(step: number): SetRevealStep {
  return {
    type: 'SET_REVEAL_STEP',
    step,
  };
}

export type SetRevealData = {
  type: 'SET_REVEAL_DATA';
  reveal: StandingsHistory;
};

export function setRevealData(reveal: StandingsHistory): SetRevealData {
  return {
    type: 'SET_REVEAL_DATA',
    reveal,
  };
}

export type AppAction =
  | UpdateFeeds
  | UpdateBroadcast
  | UpdateSettings
  | ToggleSetting
  | SetRevealStep
  | SetRevealData;
