import React from 'react';

import FooterContainer from '../containers/FooterContainer';
import NavBarContainer from '../containers/NavBarContainer';
import ThemeContainer from '../containers/ThemeContainer';

const Frame = ({ children }) => {
  return (
    <div style={{width: '100%'}}>
      <NavBarContainer />
      <div style={{ paddingTop: '70px' }} />
      <div className="container" style={{position: 'relative' }}>
        {children}
      </div>
      <FooterContainer />
      <ThemeContainer />
    </div>
  );
};

export default Frame;
