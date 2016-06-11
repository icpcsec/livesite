import axios from 'axios';
import moment from 'moment';
import React from 'react';

const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm';

class AdminFrontPageEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      apiKey: '',
      frontPageHtml: '',
      title: '',
      startTime: 0,
      endTime: 0,
      freezeTime: 0,
      timeScale: 1,
      problemLink: '',
    };
  }

  resetState(newProps) {
    this.setState({
      frontPageHtml: newProps.contest.frontPageHtml || '',
      title: newProps.contest.title || '',
      startTime: newProps.contest.times.start || 0,
      endTime: newProps.contest.times.end || 0,
      freezeTime: newProps.contest.times.freeze || 0,
      timeScale: newProps.contest.times.scale || 1,
      problemLink: newProps.contest.problemLink || '',
    });
  }

  componentWillMount() {
    this.resetState(this.props);
  }

  componentWillReceiveProps(newProps) {
    this.resetState(newProps);
  }

  handleSubmitClick(e) {
    e.preventDefault();
    const form = new FormData();
    form.set('api_key', this.state.apiKey);
    form.set('update', JSON.stringify({
      $set: {
        title: this.state.title,
        frontPageHtml: this.state.frontPageHtml,
        'times.start': this.state.startTime,
        'times.end': this.state.endTime,
        'times.freeze': this.state.freezeTime,
        'times.scale': this.state.timeScale,
        problemLink: this.state.problemLink,
      },
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
        <h3>Title</h3>
        <form>
          <div className="form-group">
            <input className="form-control" type="text" value={this.state.title} onChange={(e) => this.setState({title: e.target.value})} />
          </div>
        </form>
        <h3>Times</h3>
        <form>
          <div className="row">
            <div className="col-xs-3">
              <div className="form-group">
                <label>Start</label>
                <input
                  className="form-control"
                  type="datetime-local"
                  value={moment.unix(this.state.startTime).format(DATETIME_FORMAT)}
                  onChange={(e) => this.setState({startTime: moment(e.target.value, DATETIME_FORMAT).unix()})}
                />
              </div>
            </div>
            <div className="col-xs-3">
              <div className="form-group">
                <label>End</label>
                <input
                  className="form-control"
                  type="datetime-local"
                  value={moment.unix(this.state.endTime).format(DATETIME_FORMAT)}
                  onChange={(e) => this.setState({endTime: moment(e.target.value, DATETIME_FORMAT).unix()})}
                />
              </div>
            </div>
            <div className="col-xs-3">
              <div className="form-group">
                <label>Freeze</label>
                <input
                  className="form-control"
                  type="datetime-local"
                  value={moment.unix(this.state.freezeTime).format(DATETIME_FORMAT)}
                  onChange={(e) => this.setState({freezeTime: moment(e.target.value, DATETIME_FORMAT).unix()})}
                />
              </div>
            </div>
            <div className="col-xs-3">
              <div className="form-group">
                <label>Scale</label>
                <input
                  className="form-control"
                  type="number"
                  value={this.state.timeScale}
                  onChange={(e) => this.setState({timeScale: parseFloat(e.target.value)})}
                />
              </div>
            </div>
          </div>
        </form>
        <h3>Front Page</h3>
        <textarea
          style={{ width: '100%', height: '200px' }}
          value={ this.state.frontPageHtml }
          onChange={(e) => this.setState({frontPageHtml: e.target.value})}
        />
        <h3>Preview</h3>
        <div className="panel panel-default">
          <div className="panel-body">
            <div dangerouslySetInnerHTML={{ __html: this.state.frontPageHtml }} />
          </div>
        </div>
        <h3>Links</h3>
        <form>
          <div className="row">
            <div className="col-xs-12">
              <div className="form-group">
                <label>Problem Link</label>
                <input
                  className="form-control"
                  value={this.state.problemLink}
                  onChange={(e) => this.setState({problemLink: e.target.value})}
                />
              </div>
            </div>
          </div>
        </form>
        <form>
          <div className="row">
            <div className="col-xs-3 col-xs-offset-6">
              <div className="form-group">
                <label>API Key</label>
                <input className="form-control" type="password" value={this.state.apiKey} onChange={(e) => this.setState({apiKey: e.target.value})} />
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
