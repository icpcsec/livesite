import React from 'react';

import NavBarContainer from '../containers/NavBarContainer';
import ThemeContainer from '../containers/ThemeContainer';

const Frame = ({ children }) => {
  return (
    <div style={{width: '100%', minWidth: '1024px'}}>
      <NavBarContainer />
      <div style={{ paddingTop: '70px' }} />
      <div className="container" style={{position: 'relative' }}>
        <div style={{position: 'absolute', right: '15px'}}>
          <div className="addthis_sharing_toolbox"></div>
        </div>
        {children}
      </div>
      <ThemeContainer />
    </div>
  );
};

export default Frame;
