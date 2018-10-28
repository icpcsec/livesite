import { connect } from 'react-redux';

import LoadingCheck from './LoadingCheck';

const mapStateToProps = (state, ownProps) => {
  const loaded = ['contest', 'teams', 'standings'].every(
      (feed) => state.loader.loaded.has(feed));
  return { loaded, ...ownProps };
};

const LoadingCheckContainer = connect(mapStateToProps)(LoadingCheck);

export default LoadingCheckContainer;
