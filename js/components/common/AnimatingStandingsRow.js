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
