import React from 'react';

import Clock from './Clock';
import EventsTable from './EventsTable';
import CompactStandingsTable from './CompactStandingsTable';

const ClockPane = () => (
    <div style={{position: 'absolute', right: '20px', top: '16px'}}>
      <Clock />
    </div>
);

const EventsPane = () => (
    <div style={{position: 'absolute', top: '120px', bottom: '20px', right: '20px', width: '280px' }}>
      <EventsTable />
    </div>
);

const COMPACT_STANDINGS_NUM_ROWS = 20;

const StandingsPage = ({ page }) => (
    <CompactStandingsTable
        numRows={COMPACT_STANDINGS_NUM_ROWS}
        offsetRows={page * COMPACT_STANDINGS_NUM_ROWS}
        dense={true} />
);

const StandingsPane = () => {
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
};

const Frame = ({ children }) => (
    <div className="dashboard-frame">
      {children}
    </div>
);

const DashboardPage = () => (
    <Frame>
      <ClockPane />
      <EventsPane />
      <StandingsPane />
    </Frame>
);

export default DashboardPage;
