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
import { connect } from 'react-redux';

class AutoScrollerImpl extends React.Component {
  componentDidMount() {
    this._running = true;
    setTimeout(() => this.run_(), 1000);
  }

  componentWillUnmount() {
    this._running = false;
    const $screen = $('body,html');
    $screen.stop();
  }

  run_() {
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

function AutoScrollerSelector({ enabled }) {
  return enabled ? <AutoScrollerImpl /> : <div />
}

function mapStateToProps({ settings }) {
  return { enabled: settings.autoscroll };
}

const AutoScroller = connect(mapStateToProps)(AutoScrollerSelector);

export default AutoScroller;
