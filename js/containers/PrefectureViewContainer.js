import React from 'react';
import { connect } from 'react-redux';

import PrefectureView from '../components/PrefectureView';

const mapStateToProps = (state) => {
  const teams = Object.keys(state.teams).map((key) => state.teams[key]);
  return { teams };
};

const mapDispatchToProps = (dispatch) => ({});

const PrefectureViewContainer =
  connect(mapStateToProps, mapDispatchToProps)(PrefectureView);

export default PrefectureViewContainer;
