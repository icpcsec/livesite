import React from 'react';
import { connect } from 'react-redux';

import StandingsTable from '../components/StandingsTable';

const mapStateToProps = (state) => {
  return {
    standings: state.standings,
    teamsMap: state.teams,
    problems: state.contest.problems,
    detailed: state.contest.detailedStandings,
  };
};

const mapDispatchToProps = (dispatch) => ({});

const StandingsTableContainer =
  connect(mapStateToProps, mapDispatchToProps)(StandingsTable);

export default StandingsTableContainer;
