import React from 'react';
import { connect } from 'react-redux';

import * as actions from '../actions';
import StreamingScreen from '../components/StreamingScreen';

const mapStateToProps = ({}) => ({});

const mapDispatchToProps = (dispatch) => ({
  showStreaming(x, y) {
    dispatch(actions.showStreaming(x, y));
  },

  hideStreaming() {
    dispatch(actions.hideStreaming());
  },
});

const StreamingScreenContainer =
  connect(mapStateToProps, mapDispatchToProps)(StreamingScreen);

export default StreamingScreenContainer;
