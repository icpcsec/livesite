import React from 'react';
import { connect } from 'react-redux';

import TeamList from '../components/TeamList';

const mapStateToProps = (state) => {
  const teams = Object.keys(state.teams).map((key) => state.teams[key]);
  return { teams };
};

const mapDispatchToProps = (dispatch) => ({});

const TeamListContainer =
  connect(mapStateToProps, mapDispatchToProps)(TeamList);

export default TeamListContainer;
