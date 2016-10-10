import React from 'react';

import StandingsRevealTableContainer from '../containers/StandingsRevealTableContainer';
import * as siteconfig from '../siteconfig';

const StandingsRevealPage = () => (
  <div>
    <h1 className="page-header">
      {siteconfig.JA ? '順位表' : 'Standings'}
    </h1>
    <StandingsRevealTableContainer />
  </div>
);

export default StandingsRevealPage;
