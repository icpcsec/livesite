import React from 'react';
import { connect } from 'react-redux';

import TeamInfo from '../components/TeamInfo';

const mapStateToProps = (state, ownProps) => {
  const { teams, ratings } = state;
  const team = teams[ownProps.params.requestedTeamId];
  return { team, ratings };
};

const mapDispatchToProps = (dispatch) => ({});

const TeamInfoContainer =
  connect(mapStateToProps, mapDispatchToProps)(TeamInfo);

export default TeamInfoContainer;
