import React from 'react';

import ClockPane from './ClockPane';
import StandingsPane from './StandingsPane';
import EventsPane from './EventsPane';

const BroadcastPage = () => (
  <div>
    <ClockPane />
    <StandingsPane />
    <EventsPane />
  </div>
);

export default BroadcastPage;
