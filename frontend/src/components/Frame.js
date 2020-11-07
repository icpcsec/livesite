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

import React from 'react';
import {Route, Switch} from 'react-router-dom';

import Footer from './common/Footer';
import NavBar from './common/NavBar';
import Theme from './common/Theme';

function Frame({ children }) {
  return (
    <div style={{width: '100%'}}>
      <Switch>
        <Route path="/reveal/" />
        <Route>
          <NavBar />
        </Route>
      </Switch>
      <div style={{ paddingTop: '70px' }} />
      <div className="container" style={{position: 'relative' }}>
        {children}
      </div>
      <Footer />
      <Theme />
    </div>
  );
}

export default Frame;
