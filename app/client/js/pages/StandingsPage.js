import React from 'react';

import AutoScrollerContainer from '../containers/AutoScrollerContainer';
import StandingsTableContainer from '../containers/StandingsTableContainer';
import * as siteconfig from '../siteconfig';

const StandingsPage = () => (
  <div>
    <h1 className="page-header">
      {siteconfig.JA ? '順位表' : 'Standings'}
    </h1>
    <StandingsTableContainer />
    <AutoScrollerContainer />
  </div>
);

export default StandingsPage;
