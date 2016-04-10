import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { IndexRoute, Router, Route, browserHistory } from 'react-router';
import { createStore } from 'redux';

import App from './pages/App';
import FrontPage from './pages/FrontPage';
import StandingsPage from './pages/StandingsPage';
import TeamInfoPage from './pages/TeamInfoPage';
import TeamIndexPage from './pages/TeamIndexPage';
import reducer from './reducers';
import * as standingsLoaders from './controllers/standingsLoaders';

const store = createStore(reducer);

const loader = standingsLoaders.createDefault(store);
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
