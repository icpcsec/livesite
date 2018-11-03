import React from 'react';

import StandingsRevealTable from './StandingsRevealTable';
import { tr } from '../../i18n';

const StandingsRevealPage = () => (
  <div>
    <h1 className="my-4">
      {tr('Standings', '順位表')}
    </h1>
    <StandingsRevealTable />
  </div>
);

export default StandingsRevealPage;
