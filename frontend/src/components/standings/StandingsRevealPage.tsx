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

import StandingsRevealTable from './StandingsRevealTable';
import { tr } from '../../i18n';

export default function StandingsRevealPage() {
  return (
    <div>
      <h1 className="my-4">{tr('Standings', '順位表')}</h1>
      <StandingsRevealTable />
    </div>
  );
}
