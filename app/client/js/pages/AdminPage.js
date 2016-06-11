import React from 'react';

import AdminContestEditorContainer from '../containers/AdminContestEditorContainer';

class AdminPage extends React.Component {
  componentDidMount() {
    // Install handlers for togglebutton.
    $.material.togglebutton();
  }

  render() {
    return (
      <div>
        <h1 className="page-header">
          Administration
        </h1>
        <div style={{display: 'none'}}>
          <h2>UI Switches</h2>
          <form>
            <div className="form-group">
              <div className="togglebutton">
                <label>
                  <input type="checkbox" checked={false} />
                  Inverted coloring (not implemented yet)
                </label>
              </div>
            </div>
            <div className="form-group">
              <div className="togglebutton">
                <label>
                  <input type="checkbox" checked={false} />
                  Autoscroll standings (not implemented yet)
                </label>
              </div>
            </div>
          </form>
        </div>
        <h2>Edit Contest Info</h2>
        <AdminContestEditorContainer />
      </div>
    );
  }
};

export default AdminPage;
