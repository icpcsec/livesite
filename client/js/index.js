import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';

import App from './pages/App';
import reducer from './reducers';
import LiveLoader from './loaders/LiveLoader';

const store = createStore(
  reducer,
  {},
  window.devToolsExtension ? window.devToolsExtension() : undefined);

const loader = new LiveLoader(store);
loader.start();

ReactDOM.render(
  <App store={store} loader={loader} />,
  document.getElementById('root')
);

$.material.init();
