import React from 'react';
import { connect } from 'react-redux';

import AdminFrontPageEditor from '../components/AdminFrontPageEditor';

const mapStateToProps = ({ contest }) => ({ contest });

const mapDispatchToProps = (dispatch) => ({});

const AdminFrontPageEditorContainer =
  connect(mapStateToProps, mapDispatchToProps)(AdminFrontPageEditor);

export default AdminFrontPageEditorContainer;
