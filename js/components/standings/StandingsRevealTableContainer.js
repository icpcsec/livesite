import { connect } from 'react-redux';

import * as actions from '../../actions/index';
import StandingsRevealTable from './StandingsRevealTable';

const mapStateToProps = (state) => {
  const { standingsList, standingsIndex } = state.reveal;
  const standings = standingsList[standingsIndex];
  return {
    teamsMap: state.teams,
    pinnedTeamIds: [],
    togglePin: (teamId) => {},
    entries: standings.entries,
    problems: standings.problems,
    standingsIndex: standingsIndex,
    numStandings: standingsList.length,
  };
};

const mapDispatchToProps = (dispatch) => ({
  setStandingsIndex(index) {
    dispatch(actions.setRevealStandingsIndex(index));
  },

  setStandingsList(standingsList) {
    dispatch(actions.setRevealStandingsList(standingsList));
  },
});

const StandingsRevealTableContainer =
  connect(mapStateToProps, mapDispatchToProps)(StandingsRevealTable);

export default StandingsRevealTableContainer;
