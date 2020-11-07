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

import Clock from './Clock';
import EventsTable from './EventsTable';
import CompactStandingsTable from './CompactStandingsTable';

function ClockPane() {
  return (
    <div style={{position: 'absolute', right: '20px', top: '16px'}}>
      <Clock />
    </div>
  );
}

function EventsPane() {
  return (
    <div style={{position: 'absolute', top: '120px', bottom: '20px', right: '20px', width: '280px' }}>
      <EventsTable />
    </div>
  );
}

const COMPACT_STANDINGS_NUM_ROWS = 20;

function StandingsPage({ page }) {
  return (
    <CompactStandingsTable
        numRows={COMPACT_STANDINGS_NUM_ROWS}
        offsetRows={page * COMPACT_STANDINGS_NUM_ROWS}
        dense={true} />
  );
}

function StandingsPane() {
  const pages = [];
  for (let page = 0; page < 4; page++) {
    pages.push(
        <div style={{ width: '300px' }} key={page} >
          <StandingsPage page={page} />
        </div>
    );
  }
  return (
    <div style={{ position: 'absolute', left: '20px', right: '20px', bottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
      {pages}
    </div>
  );
}

function Frame({ children }) {
  return (
    <div className="dashboard-frame">
      {children}
    </div>
  );
}

function DashboardPage() {
  return (
    <Frame>
      <ClockPane />
      <EventsPane />
      <StandingsPane />
    </Frame>
  );
}

export default DashboardPage;
