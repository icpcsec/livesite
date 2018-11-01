import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import NormalScene from './NormalScene';
import StandingsScene from './StandingsScene';

const BroadcastRoutes = () => (
    <BrowserRouter>
      <Switch>
        <Route path="/broadcast/normal" component={NormalScene} />
        <Route path="/broadcast/standings" component={StandingsScene} />
      </Switch>
    </BrowserRouter>
);

export default BroadcastRoutes;
