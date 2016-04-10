import React from 'react';
import { connect } from 'react-redux';

import TeamInfo from '../components/TeamInfo';

const mapStateToProps = (state, ownProps) => {
  const { teams } = state.standings;
  const { requestedTeamIdStr } = ownProps.params;
  const requestedTeamId = parseInt(requestedTeamIdStr, 10);
  let team = {};
  teams.forEach((t) => {
    if (t.id === requestedTeamId) {
      team = t;
    }
  });
  return { team };
};

const mapDispatchToProps = (dispatch) => ({});

const LiveTeamInfo =
  connect(mapStateToProps, mapDispatchToProps)(TeamInfo);

export default LiveTeamInfo;
