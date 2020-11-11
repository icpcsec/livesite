// Copyright 2019 LiveSite authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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