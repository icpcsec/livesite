import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { IndexRoute, Router, Route, browserHistory } from 'react-router';
import { createStore } from 'redux';

import App from './components/App';
import FrontPage from './components/FrontPage';
import StandingsPage from './components/StandingsPage';
import TeamInfoPage from './components/TeamInfoPage';
import TeamIndexPage from './components/TeamIndexPage';
import reducer from './reducers';
import { createDefaultStandingsLoader } from './controllers/standingsLoaders';

const store = createStore(reducer);

const loader = createDefaultStandingsLoader(store);
loader.start();

ReactDOM.render(
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path="/" component={App}>
        <IndexRoute component={FrontPage} />
        <Route path="/standings/" component={StandingsPage} />
        <Route path="/team/">
          <IndexRoute component={TeamIndexPage} />
          <Route path="/team/:requestedTeamIdStr" component={TeamInfoPage} />
        </Route>
      </Route>
    </Router>
  </Provider>,
  document.getElementById('root')
);

$.material.init();
