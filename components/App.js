import React from 'react';

import LiveStandingsTable from '../containers/LiveStandingsTable';

const App = () => (
  <div className="container">
    <div className="page-header">
      <h1>Standings</h1>
    </div>
    <div className="row">
      <div className="col-xs-12">
        <LiveStandingsTable />
      </div>
    </div>
  </div>
);

export default App;
