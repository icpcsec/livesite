import React from 'react';

import NavBarContainer from '../containers/NavBarContainer';

const Frame = ({ children }) => {
  return (
    <div>
      <NavBarContainer />
      <div className="container">
        {children}
      </div>
    </div>
  );
};

export default Frame;
