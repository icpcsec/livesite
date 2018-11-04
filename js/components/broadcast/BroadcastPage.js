import React from 'react';

import ClockPane from './ClockPane';
import StandingsPane from './StandingsPane';
import FullStandingsPane from './FullStandingsPane';
import EventsPane from './EventsPane';

const ConfigButtons = ({ state: { view }, setState }) => (
    <div className="card broadcast-card broadcast-config" style={{ display: 'inline-block' }}>
      <div className="card-body">
        <div className="btn-group">
          <button
              className={`btn btn-sm btn-${view === 'none' ? 'danger': 'secondary'}`}
              onClick={() => setState({ view: 'none' })}>
            None
          </button>
          <button
              className={`btn btn-sm btn-${view === 'normal' ? 'danger': 'secondary'}`}
              onClick={() => setState({ view: 'normal' })}>
            Normal
          </button>
          <button
              className={`btn btn-sm btn-${view === 'standings' ? 'danger': 'secondary'}`}
              onClick={() => setState({ view: 'standings' })}>
            Standings
          </button>
        </div>
      </div>
    </div>
);

const ConfigPane = ({ state, setState }) => (
  <div style={{ position: 'absolute', top: '740px', left: '0', width: '1280px', textAlign: 'center' }}>
    <ConfigButtons state={state} setState={setState} />
  </div>
);

const Frame = ({ children }) => (
    <div className="broadcast-frame">
      {children}
    </div>
);

class BroadcastPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: 'normal',
    };
  }

  render() {
    const { view } = this.state;
    const panes = [<ClockPane key="clock" />];
    switch (view) {
      case 'normal':
        panes.push(<StandingsPane key="standings_right" />, <EventsPane key="events" />);
        break;
      case 'standings':
        panes.push(<FullStandingsPane key="standings_full" />);
        break;
    }
    return (
        <div>
          <Frame>{panes}</Frame>,
          <ConfigPane state={this.state} setState={(update) => this.setState(update)} />,
        </div>
    );
  }
}

export default BroadcastPage;
