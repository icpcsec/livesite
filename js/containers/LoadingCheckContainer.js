import { connect } from 'react-redux';

import LoadingCheck from '../components/LoadingCheck';

const mapStateToProps = (state, ownProps) => {
  const loaded = ['contest', 'teams', 'standings'].every(
      (feed) => state.loader.loaded.has(feed));
  return { loaded, ...ownProps };
};

const mapDispatchToProps = (dispatch) => ({});

const LoadingCheckContainer =
  connect(mapStateToProps, mapDispatchToProps)(LoadingCheck);

export default LoadingCheckContainer;
