import Perf from 'react-addons-perf';
import React from 'react';
import ReactDOM from 'react-dom';
import GA from 'react-ga';
import { createStore, compose } from 'redux';

import App from './pages/App';
import { createPersist } from './persist';
import reducer from './reducers';
import LiveLoader from './loaders/LiveLoader';

// TODO: Avoid hardcoding Google Analytics ID.
GA.initialize('UA-51402415-4');

const persist = createPersist();

const store = createStore(
  persist.createReducer(reducer),
  {},
  window.devToolsExtension ? window.devToolsExtension() : undefined);

persist.start(store);

const loader = new LiveLoader(store);
loader.start();

ReactDOM.render(
  <App store={store} loader={loader} />,
  document.getElementById('root')
);

$.material.init();

window.Perf = Perf;
