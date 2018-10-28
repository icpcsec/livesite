import React from 'react';
import GA from 'react-ga';
import { Provider } from 'react-redux';
import { IndexRoute, Router, Route, applyRouterMiddleware, browserHistory } from 'react-router';
import useScroll from 'react-router-scroll';

import DocumentTitleContainer  from './common/DocumentTitleContainer';
import LoadingCheckContainer from './common/LoadingCheckContainer';
import Frame from './Frame';
import FrontPage from './front/FrontPage';
import LoadingPage from './LoadingPage';
import SettingsPage from './settings/SettingsPage';
import StandingsPage from './standings/StandingsPage';
import StandingsRevealPage from './standings/StandingsRevealPage';
import TeamIndexPage from './teams/TeamIndexPage';
import TeamInfoPage from './teams/TeamInfoPage';

function handleNavigation() {
  GA.pageview(window.location.pathname);
}

class App extends React.Component {
  render() {
    const { store } = this.props;
    return (
      <Provider store={store}>
        <LoadingCheckContainer loading={<LoadingPage/>}>
          <DocumentTitleContainer>
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
          </DocumentTitleContainer>
        </LoadingCheckContainer>
      </Provider>
    );
  }
}

export default App;
