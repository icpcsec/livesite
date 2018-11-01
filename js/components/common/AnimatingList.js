import React from 'react';

import TimerSet from '../../utils/TimerSet';

class AnimatingList extends React.Component {
  constructor(props) {
    super(props);
    this.ref_ = React.createRef();
    this.timers_ = new TimerSet();
  }

  getSnapshotBeforeUpdate() {
    const rows = Array.from(this.ref_.current.children);

    // Cancel all animations.
    this.timers_.clearTimeouts();
    rows.forEach((row) => {
      row.classList.remove('animating');
      row.style.transform = null;
    });

    // Record the previous row positions.
    const lastKeyToOffsetTop = new Map();
    for (const row of rows) {
      lastKeyToOffsetTop.set(row.dataset.key, row.offsetTop);
    }
    return lastKeyToOffsetTop;
  }

  componentDidUpdate(prevProps, prevState, lastKeyToOffsetTop) {
    const rows = Array.from(this.ref_.current.children);

    // Currently all rows are in the final position. Record all positions.
    const currentKeyToOffsetTop = new Map();
    for (const row of rows) {
      // The following line will cause forced relayout, but it is expected.
      currentKeyToOffsetTop.set(row.dataset.key, row.offsetTop);
    }

    // Schedule animations.
    for (const row of rows) {
      const key = row.dataset.key;
      const currentOffsetTop = currentKeyToOffsetTop.get(key);
      const lastOffsetTop =
          lastKeyToOffsetTop.has(key) ?
          lastKeyToOffsetTop.get(key) :
          currentOffsetTop;
      const relativeOffsetTop = lastOffsetTop - currentOffsetTop;
      if (relativeOffsetTop !== 0) {
        row.style.transform = `translate(0, ${relativeOffsetTop}px)`;
        const animationDelay = row.classList.contains('no-animation') ? 0 : 1000;
        this.timers_.setTimeout(() => {
          row.classList.add('animating');
          row.style.transform = 'translate(0, 0)';
        }, animationDelay);
      }
    }
  }

  componentWillUnmount() {
    this.timers_.clearTimeouts();
  }

  render() {
    const { children, ...rest } = this.props;
    return (
        <div {...rest} ref={this.ref_}>
          {children}
        </div>
    );
  }
}

export default AnimatingList;
