import React from 'react';
import GA from 'react-ga';
import {
  applyRouterMiddleware,
  browserHistory,
  IndexRoute,
  Route, Router,
} from 'react-router';
import useScroll from 'react-router-scroll';

import Frame from './Frame';
import FrontPage from './front/FrontPage';
import StandingsPage from './standings/StandingsPage';
import TeamIndexPage from './teams/TeamIndexPage';
import TeamInfoPage from './teams/TeamInfoPage';
import SettingsPage from './settings/SettingsPage';
import StandingsRevealPage from './standings/StandingsRevealPage';

function handleNavigation() {
  GA.pageview(window.location.pathname);
}

const DefaultRoutes = () => (
  <Router
      history={browserHistory}
      render={applyRouterMiddleware(useScroll())}
      onUpdate={handleNavigation}>
    <Route path="/" component={Frame}>
      <IndexRoute component={FrontPage} />
      <Route path="/standings/" component={StandingsPage} />
      <Route path="/team/">
        <IndexRoute component={TeamIndexPage} />
        <Route path="/team/:requestedTeamId" component={TeamInfoPage} />
      </Route>
      <Route path="/settings/" component={SettingsPage} />
      <Route path="/reveal/" component={StandingsRevealPage} />
    </Route>
  </Router>
);

export default DefaultRoutes;
