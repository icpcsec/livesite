import React from 'react';

import LiveStandingsTable from '../containers/LiveStandingsTable';

const StandingsPage = () => (
  <div>
    <h1 className="page-header">
      Standings
    </h1>
    <LiveStandingsTable />
  </div>
);

export default StandingsPage;
