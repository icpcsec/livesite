import React from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';

import Frame from './Frame';
import FrontPage from './front/FrontPage';
import StandingsPage from './standings/StandingsPage';
import TeamIndexPage from './teams/TeamIndexPage';
import TeamInfoPage from './teams/TeamInfoPage';
import SettingsPage from './settings/SettingsPage';
import StandingsRevealPage from './standings/StandingsRevealPage';
import GA from './common/GA';
import BroadcastPage from './broadcast/BroadcastPage';
import LoadingCheck from './common/LoadingCheck';
import LoadingPage from './LoadingPage';

const Routes = () => (
  <BrowserRouter>
    <Switch>
      <Route path="/broadcast/">
        <LoadingCheck loading={null}>
          <BroadcastPage />
        </LoadingCheck>
      </Route>
      <Route>
        <LoadingCheck loading={<LoadingPage />}>
          <Frame>
            <Switch>
              <Route exact path="/" component={FrontPage} />
              <Route path="/standings/" component={StandingsPage} />
              <Route exact path="/team/" component={TeamIndexPage} />
              <Route path="/team/:requestedTeamId" component={TeamInfoPage} />
              <Route path="/settings/" component={SettingsPage} />
              <Route path="/reveal/" component={StandingsRevealPage} />
            </Switch>
          </Frame>
          <GA />
        </LoadingCheck>
      </Route>
    </Switch>
  </BrowserRouter>
);

export default Routes;
