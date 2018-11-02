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
import NormalScene from './broadcast/NormalScene';
import StandingsScene from './broadcast/StandingsScene';
import LoadingCheckContainer from './common/LoadingCheckContainer';
import LoadingPage from './LoadingPage';

const Routes = () => (
  <BrowserRouter>
    <Switch>
      <Route path="/broadcast/">
        <LoadingCheckContainer loading={null}>
          <Route path="/broadcast/normal" component={NormalScene} />
          <Route path="/broadcast/standings" component={StandingsScene} />
        </LoadingCheckContainer>
      </Route>
      <Route>
        <LoadingCheckContainer loading={<LoadingPage />}>
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
          <GAContainer />
        </LoadingCheckContainer>
      </Route>
    </Switch>
  </BrowserRouter>
);

export default Routes;
