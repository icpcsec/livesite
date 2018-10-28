import React from 'react';
import { browserHistory, Route, Router } from 'react-router';

import NormalScene from './NormalScene';

const BroadcastRoutes = () => (
    <Router history={browserHistory}>
      <Route path="/broadcast/normal" component={NormalScene} />
    </Router>
);

export default BroadcastRoutes;
