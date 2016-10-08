import React from 'react';

import StandingsTableContainer from '../containers/StandingsTableContainer';
import * as siteconfig from '../siteconfig';

const StandingsPage = () => (
  <div>
    <h1 className="page-header">
      {siteconfig.JA ? '順位表' : 'Standings'}
    </h1>
    <StandingsTableContainer />
  </div>
);

export default StandingsPage;
