// Copyright 2019 LiveSite authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from 'react';
import { connect } from 'react-redux';

import Clock from './Clock';
import DetailedStandingsTable from './DetailedStandingsTable';
import EventsTable from './EventsTable';
import ProblemsTable from './ProblemsTable';
import CompactStandingsTable from './CompactStandingsTable';
import ConfigPanel from './ConfigPanel';

function ClockPane() {
  return (
    <div style={{ position: 'absolute', right: '20px', top: '16px' }}>
      <Clock />
    </div>
  );
}

function EventsPane() {
  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        bottom: '20px',
        left: '20px',
        width: '280px',
      }}
    >
      <EventsTable />
    </div>
  );
}

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
    const {
      component: Component,
      page,
      numPages,
      interval,
      ...rest
    } = this.props;
    return <Component page={this.state.page} {...rest} />;
  }
}

const COMPACT_STANDINGS_NUM_ROWS = 17;

function CompactStandingsTablePage({ page }) {
  return (
    <CompactStandingsTable
      dense={true}
      numRows={COMPACT_STANDINGS_NUM_ROWS}
      offsetRows={page * COMPACT_STANDINGS_NUM_ROWS}
    />
  );
}

function CompactStandingsPane({ page, numEntries }) {
  return (
    <div
      style={{
        position: 'absolute',
        right: '20px',
        bottom: '20px',
        width: '360px',
      }}
    >
      <AutoPager
        component={CompactStandingsTablePage}
        interval={10 * 1000}
        page={page}
        numPages={Math.ceil(numEntries / COMPACT_STANDINGS_NUM_ROWS)}
      />
    </div>
  );
}

const DETAILED_STANDINGS_NUM_ROWS = 12;

function DetailedStandingsTablePage({ page }) {
  return (
    <DetailedStandingsTable
      numRows={DETAILED_STANDINGS_NUM_ROWS}
      offsetRows={page * DETAILED_STANDINGS_NUM_ROWS}
    />
  );
}

function DetailedStandingsPane({ page, numEntries }) {
  return (
    <div style={{ position: 'absolute', bottom: '20px', left: '320px' }}>
      <AutoPager
        component={DetailedStandingsTablePage}
        interval={10 * 1000}
        page={page}
        numPages={Math.ceil(numEntries / DETAILED_STANDINGS_NUM_ROWS)}
      />
    </div>
  );
}

function ProblemsPane() {
  return (
    <div
      style={{
        position: 'absolute',
        right: '40px',
        bottom: '20px',
        width: '120px',
      }}
    >
      <ProblemsTable />
    </div>
  );
}

function Frame({ children }) {
  return <div className="broadcast-frame">{children}</div>;
}

function BroadcastPageImpl({ broadcast: { view, page }, numEntries }) {
  const panes = [<ClockPane key="clock" />, <EventsPane key="events" />];
  switch (view) {
    case 'normal':
      panes.push(
        <CompactStandingsPane
          key="standings_right"
          page={page}
          numEntries={numEntries}
        />
      );
      break;
    case 'detailed':
      panes.push(
        <DetailedStandingsPane
          key="standings_detailed"
          page={page}
          numEntries={numEntries}
        />,
        <ProblemsPane key="problems" />
      );
      break;
    case 'problems':
      panes.push(<ProblemsPane key="problems" />);
      break;
  }
  return <Frame>{panes}</Frame>;
}

function mapStateToProps({
  broadcast,
  feeds: {
    standings: { entries },
  },
}) {
  return { broadcast, numEntries: entries.length };
}

const BroadcastPage = connect(mapStateToProps)(BroadcastPageImpl);

export default BroadcastPage;
