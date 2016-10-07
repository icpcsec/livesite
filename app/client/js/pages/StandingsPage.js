import React from 'react';

import StandingsTableContainer from '../containers/StandingsTableContainer';
import * as settings from '../settings';

const StandingsPage = () => (
  <div>
    <h1 className="page-header">
      {settings.JA ? '順位表' : 'Standings'}
    </h1>
    <StandingsTableContainer />
  </div>
);

export default StandingsPage;
