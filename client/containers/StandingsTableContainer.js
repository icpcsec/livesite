import React from 'react';
import { connect } from 'react-redux';

import StandingsTable from '../components/StandingsTable';

const mapStateToProps = ({ standings }) => ({ standings });

const mapDispatchToProps = (dispatch) => ({});

const StandingsTableContainer =
  connect(mapStateToProps, mapDispatchToProps)(StandingsTable);

export default StandingsTableContainer;
