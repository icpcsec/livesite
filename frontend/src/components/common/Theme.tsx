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

import React from 'react';
import { useAppSelector } from '../../redux';

const LIGHT_STYLES = 'body { color: #000 !important }';

const DARK_STYLES =
  'body { color: #fff !important; background-color: #303030 !important; }' +
  '.navbar { background-color: #212121 !important; }' +
  '.card { background-color: #424242 !important; }' +
  '.form-control { color: #e0e0e0 !important; }' +
  'textarea { background-color: #303030 !important; }' +
  '.standings .team-row.sticky { background-color: #616161 !important; }';

export default function Theme() {
  const invertColor = useAppSelector(
    ({ settings: { invertColor } }) => invertColor
  );
  if (invertColor) {
    return <style>{DARK_STYLES}</style>;
  }
  return <style>{LIGHT_STYLES}</style>;
}
