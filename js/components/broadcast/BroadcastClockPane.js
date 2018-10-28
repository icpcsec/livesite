import React from 'react';
import {sprintf} from "sprintf-js";

import ClockTextContainer from '../common/ClockTextContainer';

const Clock = () => (
    <div style={{
      fontSize: '48px',
      fontWeight: 'bold',
      color: '#f5f5f5',
      WebkitTextStroke: '1.5px black'
    }}>
      <ClockTextContainer/>
    </div>
);

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

const BroadcastClockPane = ({ times }) => {
  return (
      <div style={{position: 'absolute', right: '40px', top: '20px'}}>
        <Clock />
        <div style={{marginTop: '-12px'}}>
          <ProgressBar times={times} />
        </div>
      </div>
  );
};

export default BroadcastClockPane;
