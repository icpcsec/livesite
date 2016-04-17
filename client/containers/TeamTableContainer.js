import React from 'react';
import { connect } from 'react-redux';

import TeamTable from '../components/TeamTable';

const mapStateToProps = ({ teams }) => ({ teams });

const mapDispatchToProps = (dispatch) => ({});

const TeamTableContainer =
  connect(mapStateToProps, mapDispatchToProps)(TeamTable);

export default TeamTableContainer;
