import {connect} from 'react-redux';

const LoadingCheckImpl = ({ loaded, children, loading }) => {
  return loaded ? children : loading;
};

const mapStateToProps = (state, ownProps) => {
  const loaded = ['contest', 'teams', 'standings'].every(
      (feed) => state.loader.loaded.has(feed));
  return { loaded, ...ownProps };
};

const LoadingCheck = connect(mapStateToProps, undefined, undefined, {pure: false})(LoadingCheckImpl);

export default LoadingCheck;
