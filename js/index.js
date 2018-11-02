// Import this first to support old browsers.
import '@babel/polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import GA from 'react-ga';
import * as Redux from 'redux';
import ReduxThunk from 'redux-thunk';

import { printBanner } from './banner';
import App from './components/App';
import { createPersist } from './persist';
import reducer from './reducers';
import siteconfig from './siteconfig';

if (siteconfig.misc.googleAnalyticsId) {
  GA.initialize(siteconfig.misc.googleAnalyticsId);
}

const persist = createPersist();

const composeEnhancersForDevTool =
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || Redux.compose;

const store = Redux.createStore(
  persist.createReducer(reducer),
  {},
  composeEnhancersForDevTool(Redux.applyMiddleware(ReduxThunk)));

persist.start(store);

ReactDOM.render(
  <App store={store} />,
  document.getElementById('root')
);

$('body').bootstrapMaterialDesign();

printBanner();
