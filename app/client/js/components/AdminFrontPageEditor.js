import axios from 'axios';
import React from 'react';

class AdminFrontPageEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      apiKey: '',
      frontPageHtml: '',
    };
  }

  resetState(newProps) {
    this.setState({
      frontPageHtml: newProps.contest.frontPageHtml || '',
    });
  }

  componentWillMount() {
    this.resetState(this.props);
  }

  componentWillReceiveProps(newProps) {
    this.resetState(newProps);
  }

  handleApiKeyChange(e) {
    this.setState({ apiKey: e.target.value });
  }

  handleFrontPageHtmlChange(e) {
    this.setState({ frontPageHtml: e.target.value });
  }

  handleSubmitClick(e) {
    e.preventDefault();
    const form = new FormData();
    form.set('api_key', this.state.apiKey);
    form.set('update', JSON.stringify({
      $set: { frontPageHtml: this.state.frontPageHtml },
    }));
    axios.post('/api/admin/update/contest', form).then((response) => {
      $.snackbar({
        content: 'Successfully updated.',
        timeout: 5000,
      });
    }, (response) => {
      if (response.status === 403) {
        $.snackbar({
          content: 'API key rejected.',
          timeout: 5000,
        });
      } else {
        $.snackbar({
          content: 'Unknown error. See JavaScript console for details.',
          timeout: 5000,
        });
        console.log(response);
      }
    });
  }

  render() {
    return (
      <div>
        <div>
          <textarea
            style={{ width: '100%', height: '200px' }}
            value={ this.state.frontPageHtml }
            onChange={this.handleFrontPageHtmlChange.bind(this)}
          />
          <h3>Preview</h3>
          <div className="panel panel-default">
            <div className="panel-body">
              <div dangerouslySetInnerHTML={{ __html: this.state.frontPageHtml }} />
            </div>
          </div>
        </div>
        <form>
          <div className="row">
            <div className="col-xs-3">
              <div className="form-group">
                <label>API Key</label>
                <input className="form-control" type="password" value={this.state.apiKey} onChange={this.handleApiKeyChange.bind(this)} />
              </div>
            </div>
            <div className="col-xs-3">
              <div className="form-group">
                <button className="btn btn-primary btn-raised" onClick={this.handleSubmitClick.bind(this)}>Update</button>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }
};

export default AdminFrontPageEditor;
