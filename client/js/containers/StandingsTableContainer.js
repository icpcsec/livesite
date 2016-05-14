import React from 'react';
import { connect } from 'react-redux';

import { updateSettings } from '../actions';
import StandingsTable from '../components/StandingsTable';

const mapStateToProps = (state) => {
  return {
    standings: state.standings,
    teamsMap: state.teams,
    problems: state.contest.problems,
    detailed: state.contest.detailedStandings,
    pinnedTeamIds: state.settings.pinnedTeamIds,
  };
};

const mapDispatchToProps = (dispatch) => {
  const setPinnedTeamIds = (teamIds) => {
    dispatch(updateSettings({pinnedTeamIds: {$set: Array.from(teamIds)}}));
  };
  return { setPinnedTeamIds };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const togglePin = (teamId) => {
    const { pinnedTeamIds } = stateProps;
    const { setPinnedTeamIds } = dispatchProps;
    const pos = pinnedTeamIds.indexOf(teamId);
    if (pos < 0) {
      const newPinnedTeamIds = pinnedTeamIds.concat([teamId]);
      setPinnedTeamIds(newPinnedTeamIds);
    } else {
      const newPinnedTeamIds = pinnedTeamIds.slice();
      newPinnedTeamIds.splice(pos, 1);
      setPinnedTeamIds(newPinnedTeamIds);
    }
  };
  const extraProps = { togglePin };
  return Object.assign({}, ownProps, stateProps, dispatchProps, extraProps);
};

const StandingsTableContainer =
  connect(mapStateToProps, mapDispatchToProps, mergeProps)(StandingsTable);

export default StandingsTableContainer;
