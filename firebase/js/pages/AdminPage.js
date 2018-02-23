import React from 'react';

import AdminContestEditorContainer from '../containers/AdminContestEditorContainer';
import MaterialInit from '../components/MaterialInit';

const AdminPage = () => (
  <MaterialInit>
    <h1 className="page-header">
      Administration
    </h1>
    <h2>Edit Contest Info</h2>
    <AdminContestEditorContainer />
  </MaterialInit>
);

export default AdminPage;
