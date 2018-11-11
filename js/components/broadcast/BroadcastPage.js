import React from 'react';
import {connect} from 'react-redux';

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

class AutoPager extends React.Component {
  constructor(props) {
    super(props);
    this.state = { page: 0 };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.page < 0) {
      return { page: state.page };
    }
    return { page: props.page };
  }

  componentDidMount() {
    this.timer_ = setInterval(() => this.nextPage_(), this.props.interval);
  }

  componentWillUnmount() {
    clearInterval(this.timer_);
  }

  nextPage_() {
    if (this.props.page >= 0) {
      return;
    }
    let { page } = this.state;
    page = (page + 1) % this.props.numPages;
    this.setState({ page });
  }

  render() {
    const { component: Component, page, numPages, interval, ...rest } = this.props;
    return <Component page={this.state.page} {...rest} />;
  }
}

const COMPACT_STANDINGS_NUM_ROWS = 20;

const CompactStandingsTablePage = ({ page }) => (
    <CompactStandingsTable
        numRows={COMPACT_STANDINGS_NUM_ROWS}
        offsetRows={page * COMPACT_STANDINGS_NUM_ROWS} />
);

const CompactStandingsPane = ({ page, numEntries }) => (
    <div style={{ position: 'absolute', right: '20px', bottom: '20px', width: '300px' }}>
      <AutoPager
          component={CompactStandingsTablePage}
          interval={10 * 1000}
          page={page}
          numPages={Math.ceil(numEntries / COMPACT_STANDINGS_NUM_ROWS)} />
    </div>
);

const DETAILED_STANDINGS_NUM_ROWS = 12;

const DetailedStandingsTablePage = ({ page }) => (
    <DetailedStandingsTable
        numRows={DETAILED_STANDINGS_NUM_ROWS}
        offsetRows={page * DETAILED_STANDINGS_NUM_ROWS} />
);

const DetailedStandingsPane = ({ page, numEntries }) => (
    <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-around' }}>
      <AutoPager
          component={DetailedStandingsTablePage}
          interval={5 * 1000}
          page={page}
          numPages={Math.ceil(numEntries / DETAILED_STANDINGS_NUM_ROWS)} />
    </div>
);

const ProblemsPane = () => (
    <div style={{ position: 'absolute', right: '40px', bottom: '20px', width: '120px' }}>
      <ProblemsTable />
    </div>
);

const Frame = ({ children }) => (
    <div className="broadcast-frame">
      {children}
    </div>
);

const BroadcastPageImpl = ({ broadcast: { view, page }, numEntries }) => {
  const panes = [
      <ClockPane key="clock" />,
      <EventsPane key="events" />,
  ];
  switch (view) {
    case 'normal':
      panes.push(
          <CompactStandingsPane key="standings_right" page={page} numEntries={numEntries} />);
      break;
    case 'detailed':
      panes.push(
          <DetailedStandingsPane key="standings_detailed" page={page} numEntries={numEntries} />,
          <ProblemsPane key="problems" />);
      break;
    case 'problems':
      panes.push(
          <ProblemsPane key="problems" />);
      break;
  }
  return (
      <div>
        <Frame>
          {panes}
        </Frame>
      </div>
  );
};

const mapStateToProps = ({ broadcast, feeds: { standings: { entries } } }) => ({ broadcast, numEntries: entries.length });

const BroadcastPage = connect(mapStateToProps)(BroadcastPageImpl);

export default BroadcastPage;
