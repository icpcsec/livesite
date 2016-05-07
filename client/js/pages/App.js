import React from 'react';
import { Provider } from 'react-redux';
import { IndexRoute, Router, Route, browserHistory } from 'react-router';

import LoadingCheckContainer from '../containers/LoadingCheckContainer';
import Frame from './Frame';
import FrontPage from './FrontPage';
import LoadingPage from './LoadingPage';
import StandingsPage from './StandingsPage';
import TeamEditPage from './TeamEditPage';
import TeamIndexPage from './TeamIndexPage';
import TeamInfoPage from './TeamInfoPage';

class App extends React.Component {
  getChildContext() {
    return { loader: this.props.loader };
  }

  render() {
    return (
      <Provider store={this.props.store}>
        <LoadingCheckContainer loading={<LoadingPage/>}>
          <Router history={browserHistory}>
            <Route path="/" component={Frame}>
              <IndexRoute component={FrontPage} />
              <Route path="/standings/" component={StandingsPage} />
              <Route path="/team/">
                <IndexRoute component={TeamIndexPage} />
                <Route path="/team/:requestedTeamId" component={TeamInfoPage} />
                <Route path="/team/:requestedTeamId/edit" component={TeamEditPage} />
              </Route>
            </Route>
          </Router>
        </LoadingCheckContainer>
      </Provider>
    );
  }
};
App.propTypes = {
  loader: () => React.PropTypes.func.isRequired,
  store: () => React.PropTypes.func.isRequired,
};
App.childContextTypes = {
  loader: () => React.PropTypes.func.isRequired,
};

export default App;
