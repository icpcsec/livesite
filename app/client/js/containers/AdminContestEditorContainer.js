import React from 'react';
import { connect } from 'react-redux';

import AdminContestEditor from '../components/AdminContestEditor';

const mapStateToProps = ({ contest }) => ({ contest });

const mapDispatchToProps = (dispatch) => ({});

const AdminContestEditorContainer =
  connect(mapStateToProps, mapDispatchToProps)(AdminContestEditor);

export default AdminContestEditorContainer;
