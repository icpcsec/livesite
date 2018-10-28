import React from 'react';

import TimerSet from '../../utils/TimerSet';

class AnimatingList extends React.Component {
  constructor(props) {
    super(props);
    this.timers_ = new TimerSet();
  }

  componentWillUpdate() {
    const rows = Array.from(this._dom.children);

    // Cancel all animations.
    this.timers_.clearTimeouts();
    rows.forEach((row) => {
      row.classList.remove('animating');
      row.style.transform = null;
    });

    // Record the previous row positions.
    this._lastKeyToOffsetTop = new Map();
    rows.forEach((row, i) => {
      const child = this.props.children[i];
      this._lastKeyToOffsetTop.set(child.key, row.offsetTop);
    });
  }

  componentDidUpdate() {
    const rows = Array.from(this._dom.children);

    // Currently all rows are in the final position. Record all positions.
    const currentKeyToOffsetTop = new Map();
    rows.forEach((row, i) => {
      const child = this.props.children[i];
      // The following line will cause forced relayout, but it is expected.
      currentKeyToOffsetTop.set(child.key, row.offsetTop);
    });

    // Schedule animations.
    rows.forEach((row, i) => {
      const child = this.props.children[i];
      const currentOffsetTop = currentKeyToOffsetTop.get(child.key);
      const lastOffsetTop =
          this._lastKeyToOffsetTop.has(child.key) ?
              this._lastKeyToOffsetTop.get(child.key) :
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
    });
  }

  componentWillUnmount() {
    this.timers_.clearTimeouts();
  }

  render() {
    const { children, ...rest } = this.props;
    return (
        <div {...rest} ref={(dom) => { this._dom = dom; }}>
          {children}
        </div>
    );
  }
}

export default AnimatingList;
