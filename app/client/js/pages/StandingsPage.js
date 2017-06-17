import React from 'react';

import AutoScrollerContainer from '../containers/AutoScrollerContainer';
import StandingsTableContainer from '../containers/StandingsTableContainer';
import { tr } from '../i18n';

const StandingsPage = () => (
  <div>
    <h1 className="page-header">
      {tr('Standings', '順位表')}
    </h1>
    <StandingsTableContainer />
    <AutoScrollerContainer />
  </div>
);

export default StandingsPage;
