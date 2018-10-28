import React from 'react';
import { browserHistory, Route, Router } from 'react-router';

import NormalScene from './NormalScene';
import StandingsScene from './StandingsScene';

const BroadcastRoutes = () => (
    <Router history={browserHistory}>
      <Route path="/broadcast/normal" component={NormalScene} />
      <Route path="/broadcast/standings" component={StandingsScene} />
    </Router>
);

export default BroadcastRoutes;
