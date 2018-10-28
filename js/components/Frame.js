import React from 'react';

import FooterContainer from './common/FooterContainer';
import NavBarContainer from './common/NavBarContainer';
import ThemeContainer from './common/ThemeContainer';

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
