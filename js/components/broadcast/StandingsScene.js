import React from 'react';

import BroadcastClockPaneContainer from './BroadcastClockPaneContainer';
import BroadcastStandingsTableContainer from './BroadcastStandingsTableContainer';

const Page = ({page}) => (
    <div style={{ width: '380px', flex: '0 0 auto' }}>
      <BroadcastStandingsTableContainer numRows={20} offsetRows={20 * page} />
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
      <BroadcastClockPaneContainer />
      <BroadcastStandingsPane />
    </div>
);

export default StandingsScene;
