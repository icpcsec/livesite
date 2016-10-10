import React from 'react';
import { connect } from 'react-redux';

import StandingsRevealTable from '../components/StandingsRevealTable';

const mapStateToProps = (state) => {
  return {
    teamsMap: state.teams,
    problems: state.contest.problems,
    detailed: state.contest.detailedStandings,
    pinnedTeamIds: [],
    togglePin: (teamId) => {},
  };
};

const StandingsRevealTableContainer = connect(mapStateToProps)(StandingsRevealTable);

export default StandingsRevealTableContainer;
