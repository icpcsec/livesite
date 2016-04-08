import React from 'react';
import { connect } from 'react-redux';

import TeamTable from '../components/TeamTable';

const mapStateToProps = ({ standings: { teams } }) => ({ teams });

const mapDispatchToProps = (dispatch) => ({});

const LiveTeamTable =
  connect(mapStateToProps, mapDispatchToProps)(TeamTable);

export default LiveTeamTable;
