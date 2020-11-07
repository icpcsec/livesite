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
import {connect} from 'react-redux';
import {sprintf} from "sprintf-js";

import ClockText from '../common/ClockText';

class ProgressBar extends React.Component {
  updateState_() {
    const { times: { start = 1, end = 0 } } = this.props;
    const now = new Date().getTime() / 1000;
    const progress = (Math.min(end, Math.max(start, now)) - start) / (end - start);
    this.setState({ progress });
  }

  componentWillMount() {
    this.updateState_();
    const { times: { scale = 1 } } = this.props;
    const updateInterval = Math.max(10000 / scale, 100);
    this._timer = setInterval(() => this.updateState_(), updateInterval);
  }

  componentWillUnmount() {
    clearInterval(this._timer);
  }

  render() {
    return (
        <div style={{border: '1px solid #000', backgroundColor: '#f5f5f5'}}>
          <div style={{
            width: sprintf('%.3f%%', 100 * this.state.progress),
            height: '8px',
            borderRight: '1px solid black',
            backgroundColor: 'orangered'
          }}>
          </div>
        </div>
    );
  }
}

const ClockImpl = ({ times }) => {
  return (
      <div>
        <div style={{
          fontSize: '48px',
          fontWeight: 'bold',
          color: '#f5f5f5',
          WebkitTextStroke: '1.5px black'
        }}>
          <ClockText />
        </div>
        <div style={{marginTop: '-12px'}}>
          <ProgressBar times={times} />
        </div>
      </div>
  );
};

const mapStateToProps = ({ feeds: { contest: { times } } }) => ({ times });

const Clock =
    connect(mapStateToProps, undefined, undefined, { pure: false })(ClockImpl);

export default Clock;
