import React from 'react';

import Clock from './Clock';
import DetailedStandingsTable from './DetailedStandingsTable';
import EventsTable from './EventsTable';
import ProblemsTable from './ProblemsTable';
import CompactStandingsTable from './CompactStandingsTable';

const ClockPane = () => (
    <div style={{position: 'absolute', right: '40px', top: '20px'}}>
      <Clock />
    </div>
);

const EventsPane = () => (
    <div style={{position: 'absolute', top: '20px', bottom: '20px', left: '20px', width: '280px' }}>
      <EventsTable />
    </div>
);

const RightStandingsPane = () => (
    <div style={{ position: 'absolute', right: '20px', bottom: '20px', width: '300px' }}>
      <CompactStandingsTable />
    </div>
);

const FullStandingsPane = () => {
  const Page = ({page}) => (
      <div style={{ width: '380px', flex: '0 0 auto' }}>
        <CompactStandingsTable numRows={20} offsetRows={20 * page} />
      </div>
  );
  return (
      <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-around' }}>
        <Page page={0} />
        <Page page={1} />
        <Page page={2} />
      </div>
  );
}

const DetailedStandingsPane = () => {
  return (
      <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-around' }}>
        <DetailedStandingsTable />
      </div>
  );
};

const ProblemsPane = () => (
    <div style={{ position: 'absolute', right: '40px', bottom: '20px', width: '120px' }}>
      <ProblemsTable />
    </div>
);

const ConfigButtons = ({ state: { view }, setState }) => (
    <div className="card broadcast-config" style={{ display: 'inline-block' }}>
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
          <button
              className={`btn btn-sm btn-${view === 'detailed' ? 'danger': 'secondary'}`}
              onClick={() => setState({ view: 'detailed' })}>
            Detailed
          </button>
          <button
              className={`btn btn-sm btn-${view === 'problems' ? 'danger': 'secondary'}`}
              onClick={() => setState({ view: 'problems' })}>
            Problems
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
        panes.push(<RightStandingsPane key="standings_right" />, <EventsPane key="events" />);
        break;
      case 'standings':
        panes.push(<FullStandingsPane key="standings_full" />);
        break;
      case 'detailed':
        panes.push(<DetailedStandingsPane key="standings_detailed" />, <EventsPane key="events" />);
        break;
      case 'problems':
        panes.push(<ProblemsPane key="problems" />, <EventsPane key="events" />);
        break;
    }
    return (
        <div>
          <Frame>
            {panes}
          </Frame>
          <ConfigPane state={this.state} setState={(update) => this.setState(update)} />,
        </div>
    );
  }
}

export default BroadcastPage;
