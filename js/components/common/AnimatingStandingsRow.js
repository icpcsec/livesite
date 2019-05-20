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

import {TimerSet} from '../../utils';

class AnimatingStandingsRow extends React.Component {
  constructor(props) {
    super(props);
    this.state = { rankHidden: false, newSolved: false };
    this._timers = new TimerSet();
  }

  animateForNewSolve() {
    this.setState({ rankHidden: true, newSolved: true });
    this._timers.setTimeout(() => {
      this.setState({ newSolved: false });
    }, this.props.revealMode ? 4000 : 9000);
    this._timers.setTimeout(() => {
      this.setState({ rankHidden: false });
    }, 4000);
  }

  componentDidUpdate(prevProps) {
    if (this.props.entry.solved !== prevProps.entry.solved) {
      this.animateForNewSolve();
    }
  }

  componentWillUnmount() {
    this._timers.clearTimeouts();
  }

  render() {
    const { component: Component, index, className = '', entry, ...rest } = this.props;
    const rewrittenClassName = `${className} ${this.state.newSolved ? 'new-solved' : ''}`;
    const rewrittenEntry = Object.assign(
        {}, entry, this.state.rankHidden ? {rank: '...'} : {});
    // Wrap in <div> since AnimatingTable can manipulate it.
    return (
        <div data-key={entry.teamId} style={{ position: 'relative', zIndex: (9999 - index) }}>
          <Component className={rewrittenClassName} entry={rewrittenEntry} {...rest} />
        </div>
    );
  }
}

export default AnimatingStandingsRow;
