import React from 'react';

import AutoScrollerContainer from '../containers/AutoScrollerContainer';
import StandingsTableContainer from '../containers/StandingsTableContainer';
import { tr } from '../i18n';

const StandingsPage = () => (
  <div>
    <div className="alert alert-warning d-lg-none">
      <b>FIXME</b>: Layout is broken in narrow viewport.
    </div>
    <h1 className="my-4">
      {tr('Standings', '順位表')}
    </h1>
    <StandingsTableContainer />
    <AutoScrollerContainer />
  </div>
);

export default StandingsPage;
