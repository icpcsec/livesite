import React from 'react';

import BroadcastClockPane from './BroadcastClockPane';
import BroadcastStandingsTable from './BroadcastStandingsTable';
import BroadcastEventsPane from './BroadcastEventsPane';

const BroadcastStandingsPane = () => (
    <div style={{ position: 'absolute', right: '20px', top: '120px', width: '380px' }}>
      <BroadcastStandingsTable />
    </div>
);

const NormalScene = () => (
  <div>
    <BroadcastClockPane />
    <BroadcastStandingsPane />
    <BroadcastEventsPane />
  </div>
);

export default NormalScene;
