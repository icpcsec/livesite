import React from 'react';

import AutoScrollerContainer from '../containers/AutoScrollerContainer';
import StandingsTableContainer from '../containers/StandingsTableContainer';
import { tr } from '../i18n';

const StandingsPage = () => (
  <div>
    <h1 className="my-4">
      {tr('Standings', '順位表')}
    </h1>
    <StandingsTableContainer />
    <AutoScrollerContainer />
  </div>
);

export default StandingsPage;
