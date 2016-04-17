import React from 'react';
import { connect } from 'react-redux';

import TeamEdit from '../components/TeamEdit';

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

const TeamEditContainer =
  connect(mapStateToProps, mapDispatchToProps)(TeamEdit);

export default TeamEditContainer;
