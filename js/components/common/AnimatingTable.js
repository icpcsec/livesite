import React from 'react';

import {TimerSet} from '../../utils';

class AnimatingTable extends React.Component {
  constructor(props) {
    super(props);
    this.ref_ = React.createRef();
    this.timers_ = new TimerSet();
    this.cancels_ = [];
  }

  getSnapshotBeforeUpdate() {
    const rows = Array.from(this.ref_.current.children);

    // Record the previous row positions.
    const lastKeyOrder = [];
    const lastKeyToOffsetTop = new Map();
    for (const row of rows) {
      lastKeyOrder.push(row.dataset.key);
      lastKeyToOffsetTop.set(row.dataset.key, row.offsetTop);
    }
    return { lastKeyOrder, lastKeyToOffsetTop };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { delay = 1000 } = this.props;
    const { lastKeyOrder, lastKeyToOffsetTop } = snapshot;
    const rows = Array.from(this.ref_.current.children);

    // Check if the order changed.
    if (rows.length === lastKeyOrder.length) {
      let changed = false;
      for (let i = 0; i < rows.length; ++i) {
        if (rows[i].dataset.key !== lastKeyOrder[i]) {
          changed = true;
          break;
        }
      }
      if (!changed) {
        return;
      }
    }

    // Cancel all animations.
    this.timers_.clearTimeouts();
    for (const cancel of this.cancels_.splice(0)) {
      cancel();
    }
    rows.forEach((row) => {
      row.classList.remove('animate-table-start', 'animate-table-active');
      row.style.transform = null;
    });

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
        row.classList.add('animate-table-start');
        row.style.transform = `translate(0, ${relativeOffsetTop}px)`;
        this.timers_.setTimeout(() => {
          row.classList.add('animate-table-active');
          row.style.transform = 'translate(0, 0)';
          const finish = (e) => {
            if (e.target !== row) {
              return;
            }
            row.classList.remove('animate-table-start', 'animate-table-active');
            cancel();
          };
          const cancel = () => {
            row.removeEventListener('transitionend', finish);
          };
          row.addEventListener('transitionend', finish);
          this.cancels_.push(cancel);
        }, delay);
      }
    }
  }

  componentWillUnmount() {
    this.timers_.clearTimeouts();
  }

  render() {
    const { children } = this.props;
    return (
        <div ref={this.ref_}>
          {children}
        </div>
    );
  }
}

export default AnimatingTable;
