import { connect } from 'react-redux';

import * as actions from '../actions';
import StandingsRevealTable from '../components/StandingsRevealTable';

const mapStateToProps = (state) => {
  return {
    teamsMap: state.teams,
    problems: state.contest.problems,
    pinnedTeamIds: [],
    togglePin: (teamId) => {},
    standings: state.reveal.standingsList[state.reveal.standingsIndex],
    standingsIndex: state.reveal.standingsIndex,
    numStandings: state.reveal.standingsList.length,
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
