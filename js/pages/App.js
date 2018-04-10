import React from 'react';
import GA from 'react-ga';
import { Provider } from 'react-redux';
import { IndexRoute, Router, Route, applyRouterMiddleware, browserHistory } from 'react-router';
import useScroll from 'react-router-scroll';

import * as addthis from '../addthis';
import DocumentTitleContainer  from '../containers/DocumentTitleContainer';
import LoadingCheckContainer from '../containers/LoadingCheckContainer';
import Frame from './Frame';
import FrontPage from './FrontPage';
import LoadingPage from './LoadingPage';
import SettingsPage from './SettingsPage';
import StandingsPage from './StandingsPage';
import StandingsRevealPage from './StandingsRevealPage';
import TeamIndexPage from './TeamIndexPage';
import TeamInfoPage from './TeamInfoPage';

function handleNavigation() {
  GA.pageview(window.location.pathname);
  addthis.handleNavigation();
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
