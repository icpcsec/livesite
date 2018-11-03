import React from 'react';

import AutoScroller from '../common/AutoScroller';
import StandingsTable from './StandingsTable';
import { tr } from '../../i18n';

const StandingsPage = () => (
  <div>
    <h1 className="my-4">
      {tr('Standings', '順位表')}
    </h1>
    <StandingsTable />
    <AutoScroller />
  </div>
);

export default StandingsPage;
