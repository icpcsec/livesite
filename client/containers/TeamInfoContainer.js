import React from 'react';
import { connect } from 'react-redux';

import TeamInfo from '../components/TeamInfo';

const mapStateToProps = (state, ownProps) => {
  const { requestedTeamId } = ownProps.params;
  let team = null;
  state.teams.forEach((t) => {
    if (t.id === requestedTeamId) {
      team = t;
    }
  });
  return { team };
};

const mapDispatchToProps = (dispatch) => ({});

const TeamInfoContainer =
  connect(mapStateToProps, mapDispatchToProps)(TeamInfo);

export default TeamInfoContainer;
