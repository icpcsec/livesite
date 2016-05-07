import React from 'react';

const LoadingCheck = ({ loaded, children, loading }) => {
  return loaded ? children : loading;
};

export default LoadingCheck;
