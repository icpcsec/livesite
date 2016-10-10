import React from 'react';

class AutoScrollerImpl extends React.Component {
  componentDidMount() {
    this._running = true;
    setTimeout(() => this.run(), 1000);
  }

  componentWillUnmount() {
    this._running = false;
    $('body').stop();
  }

  run() {
    if (!this._running) {
      return;
    }
    const pixelsPerSecond = 100;
    const preWaitSeconds = 5;
    const postWaitSeconds = 20;
    const $body = $('body');
    const doScroll = () => {
      if (!this._running) {
        return;
      }
      $body.scrollTop($body.height());
      $body.animate(
        { scrollTop: 0 },
        {
          duration: $body.height() / pixelsPerSecond * 1000,
          easing: 'linear',
          done: scrollDone,
        });
    };
    const scrollDone = () => {
      setTimeout(() => this.run(), postWaitSeconds * 1000);
    }
    $body.scrollTop($body.height());
    setTimeout(doScroll, preWaitSeconds * 1000);
  }

  render() {
    return null;
  }
};

const AutoScroller = ({ enabled }) => (
  enabled ? <AutoScrollerImpl /> : <div />
);

export default AutoScroller;
