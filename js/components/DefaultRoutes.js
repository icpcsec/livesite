import React from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';

import Frame from './Frame';
import FrontPage from './front/FrontPage';
import StandingsPage from './standings/StandingsPage';
import TeamIndexPage from './teams/TeamIndexPage';
import TeamInfoPage from './teams/TeamInfoPage';
import SettingsPage from './settings/SettingsPage';
import StandingsRevealPage from './standings/StandingsRevealPage';
import GAContainer from './common/GAContainer';

const DefaultRoutes = () => (
  <BrowserRouter>
    <Frame>
      <Switch>
        <Route exact path="/" component={FrontPage} />
        <Route path="/standings/" component={StandingsPage} />
        <Route exact path="/team/" component={TeamIndexPage} />
        <Route path="/team/:requestedTeamId" component={TeamInfoPage} />
        <Route path="/settings/" component={SettingsPage} />
        <Route path="/reveal/" component={StandingsRevealPage} />
      </Switch>
      <GAContainer />
    </Frame>
  </BrowserRouter>
);

export default DefaultRoutes;
