import React from 'react';

import BroadcastClockPane from './BroadcastClockPane';
import BroadcastStandingsTable from './BroadcastStandingsTable';

const Page = ({page}) => (
    <div style={{ width: '380px', flex: '0 0 auto' }}>
      <BroadcastStandingsTable numRows={20} offsetRows={20 * page} />
    </div>
);

const BroadcastStandingsPane = () => (
    <div style={{ position: 'absolute', top: '120px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-around' }}>
      <Page page={0} />
      <Page page={1} />
      <Page page={2} />
    </div>
);

const StandingsScene = () => (
    <div>
      <BroadcastClockPane />
      <BroadcastStandingsPane />
    </div>
);

export default StandingsScene;
