import React from 'react';
import { connect } from 'react-redux';

import TeamTable from '../components/TeamTable';

const mapStateToProps = (state) => {
  const teams = Object.keys(state.teams).map((key) => state.teams[key]);
  teams.sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
  return { teams };
};

const mapDispatchToProps = (dispatch) => ({});

const TeamTableContainer =
  connect(mapStateToProps, mapDispatchToProps)(TeamTable);

export default TeamTableContainer;
