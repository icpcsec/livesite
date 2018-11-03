import React from 'react';
import TimerSet from '../../utils/TimerSet';

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
    const { component: Component, className = '', entry, ...rest } = this.props;
    const rewrittenClassName = `${className} ${this.state.newSolved ? 'new-solved' : ''}`;
    const rewrittenEntry = Object.assign(
        {}, entry, this.state.rankHidden ? {rank: '...'} : {});
    return <Component data-key={entry.teamId} className={rewrittenClassName} entry={rewrittenEntry} {...rest} />;
  }
}

export default AnimatingStandingsRow;
