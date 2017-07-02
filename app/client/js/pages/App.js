import React from 'react';
import GA from 'react-ga';
import { Provider } from 'react-redux';
import { IndexRoute, Router, Route, applyRouterMiddleware, browserHistory } from 'react-router';
import useScroll from 'react-router-scroll';

import * as addthis from '../addthis';
import LoadingCheckContainer from '../containers/LoadingCheckContainer';
import AdminPage from './AdminPage';
import Frame from './Frame';
import FrontPage from './FrontPage';
import LoadingPage from './LoadingPage';
import SettingsPage from './SettingsPage';
import StandingsPage from './StandingsPage';
import StandingsRevealPage from './StandingsRevealPage';
import StreamingPage from './StreamingPage';
import TeamEditPage from './TeamEditPage';
import TeamIndexPage from './TeamIndexPage';
import TeamInfoPage from './TeamInfoPage';

class App extends React.Component {
  getChildContext() {
    return { loader: this.props.loader };
  }

  handleNavigation() {
    GA.pageview(window.location.pathname);
    addthis.handleNavigation();
  }

  render() {
    return (
      <Provider store={this.props.store}>
        <LoadingCheckContainer loading={<LoadingPage/>}>
          <Router
              history={browserHistory}
              render={applyRouterMiddleware(useScroll())}
              onUpdate={() => this.handleNavigation()}>
            <Route path="/" component={Frame}>
              <IndexRoute component={FrontPage} />
              <Route path="/standings/" component={StandingsPage} />
              <Route path="/team/">
                <IndexRoute component={TeamIndexPage} />
                <Route path="/team/:requestedTeamId" component={TeamInfoPage} />
                <Route path="/team/:requestedTeamId/edit" component={TeamEditPage} />
              </Route>
              <Route path="/streaming/" component={StreamingPage} />
              <Route path="/settings/" component={SettingsPage} />
              <Route path="/reveal/" component={StandingsRevealPage} />
              <Route path="/admin/" component={AdminPage} />
            </Route>
          </Router>
        </LoadingCheckContainer>
      </Provider>
    );
  }
};
App.childContextTypes = {
  loader: () => React.PropTypes.func.isRequired,
};

export default App;
