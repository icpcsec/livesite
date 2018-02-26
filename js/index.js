// Import this first to support old browsers.
import 'babel-polyfill';

import Perf from 'react-addons-perf';
import React from 'react';
import ReactDOM from 'react-dom';
import GA from 'react-ga';
import * as Redux from 'redux';
import ReduxThunk from 'redux-thunk';

import * as addthis from './addthis';
import { printBanner } from './banner';
import App from './pages/App';
import { createPersist } from './persist';
import reducer from './reducers';
import FirebaseLoader from './loaders/FirebaseLoader';

const gaElement = document.getElementById('google_analytics_id');
if (gaElement && gaElement.textContent.length > 0) {
  GA.initialize(gaElement.textContent);
}

const persist = createPersist();

const composeEnhancersForDevTool =
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || Redux.compose;

const store = Redux.createStore(
  persist.createReducer(reducer),
  {},
  composeEnhancersForDevTool(Redux.applyMiddleware(ReduxThunk)));

persist.start(store);

const loader = new FirebaseLoader(store);
loader.start();

ReactDOM.render(
  <App store={store} loader={loader} />,
  document.getElementById('root')
);

$('body').bootstrapMaterialDesign();

window.Perf = Perf;

addthis.setup();

printBanner();
