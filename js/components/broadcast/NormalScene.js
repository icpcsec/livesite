import React from 'react';

import BroadcastClockPaneContainer from './BroadcastClockPaneContainer';
import BroadcastStandingsTableContainer from './BroadcastStandingsTableContainer';
import BroadcastEventsPaneContainer from './BroadcastEventsPaneContainer';

const BroadcastStandingsPane = () => (
    <div style={{ position: 'absolute', right: '20px', top: '120px', width: '380px' }}>
      <BroadcastStandingsTableContainer />
    </div>
);

const NormalScene = () => (
  <div>
    <BroadcastClockPaneContainer />
    <BroadcastStandingsPane />
    <BroadcastEventsPaneContainer />
  </div>
);

export default NormalScene;
