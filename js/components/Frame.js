import React from 'react';
import {Route, Switch} from 'react-router-dom';

import Footer from './common/Footer';
import NavBar from './common/NavBar';
import Theme from './common/Theme';

const Frame = ({ children }) => {
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
};

export default Frame;
