import React from 'react';
import { connect } from 'react-redux';

import TeamEdit from '../components/TeamEdit';

const mapStateToProps = (state, ownProps) => {
  const team = state.teams[ownProps.params.requestedTeamId];
  return { team };
};

const mapDispatchToProps = (dispatch) => ({});

const TeamEditContainer =
  connect(mapStateToProps, mapDispatchToProps)(TeamEdit);

export default TeamEditContainer;
