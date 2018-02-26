import React from 'react';

import StandingsRevealTableContainer from '../containers/StandingsRevealTableContainer';
import { tr } from '../i18n';

const StandingsRevealPage = () => (
  <div>
    <h1 className="my-4">
      {tr('Standings', '順位表')}
    </h1>
    <StandingsRevealTableContainer />
  </div>
);

export default StandingsRevealPage;
