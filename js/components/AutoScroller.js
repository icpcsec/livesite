import React from 'react';

class AutoScrollerImpl extends React.Component {
  componentDidMount() {
    this._running = true;
    setTimeout(() => this.run(), 1000);
  }

  componentWillUnmount() {
    this._running = false;
    const $screen = $('body,html');
    $screen.stop();
  }

  run() {
    if (!this._running) {
      return;
    }
    const pixelsPerSecond = 100;
    const preWaitSeconds = 5;
    const postWaitSeconds = 20;
    const $screen = $('body,html');
    const $body = $('body');
    const doScroll = () => {
      if (!this._running) {
        return;
      }
      $screen.scrollTop($body.height());
      setTimeout(() => {
        $screen.animate(
          { scrollTop: 0 },
          {
            duration: $body.height() / pixelsPerSecond * 1000,
            easing: 'linear',
            done: scrollDone,
          });
      }, 100);
    };
    const scrollDone = () => {
      $screen.stop();
      setTimeout(() => this.run(), postWaitSeconds * 1000);
    };
    $screen.scrollTop($body.height());
    setTimeout(doScroll, preWaitSeconds * 1000);
  }

  render() {
    return null;
  }
}

const AutoScroller = ({ enabled }) => (
  enabled ? <AutoScrollerImpl /> : <div />
);

export default AutoScroller;
