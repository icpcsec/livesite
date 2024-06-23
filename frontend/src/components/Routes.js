// Copyright 2019 LiveSite authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import Frame from './Frame';
import FrontPage from './front/FrontPage';
import StandingsPage from './standings/StandingsPage';
import TeamIndexPage from './teams/TeamIndexPage';
import TeamInfoPage from './teams/TeamInfoPage';
import SettingsPage from './settings/SettingsPage';
import StandingsRevealPage from './standings/StandingsRevealPage';
import GA from './common/GA';
import LoadingCheck from './common/LoadingCheck';
import LoadingPage from './LoadingPage';
import siteconfig from '../siteconfig';

function Routes() {
  const teamPageRoute = siteconfig.features.teamPage ? (
    <Route path="/team/:requestedTeamId" component={TeamInfoPage} />
  ) : null;
  return (
    <BrowserRouter>
      <LoadingCheck loading={<LoadingPage />}>
        <Frame>
          <Switch>
            <Route exact path="/" component={FrontPage} />
            <Route path="/standings/" component={StandingsPage} />
            <Route exact path="/team/" component={TeamIndexPage} />
            {teamPageRoute}
            <Route path="/settings/" component={SettingsPage} />
            <Route path="/reveal/" component={StandingsRevealPage} />
          </Switch>
        </Frame>
        <GA />
      </LoadingCheck>
    </BrowserRouter>
  );
}

export default Routes;
