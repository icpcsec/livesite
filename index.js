import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import App from './components/App';
import reducer from './reducers';
import { createDefaultStandingLoader } from './controllers/standingsLoaders';

const store = createStore(reducer);

const loader = createDefaultStandingLoader(store);
loader.start();

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
