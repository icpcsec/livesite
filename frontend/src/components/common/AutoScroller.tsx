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
import $ from 'jquery';

class AutoScrollerImpl extends React.Component {
  private running: boolean = false

  componentDidMount() {
    this.running = true;
    setTimeout(() => this.run(), 1000);
  }

  componentWillUnmount() {
    this.running = false;
    const $screen = $('body,html');
    $screen.stop();
  }

  private run() {
    if (!this.running) {
      return;
    }
    const pixelsPerSecond = 100;
    const preWaitSeconds = 5;
    const postWaitSeconds = 20;
    const $screen = $('body,html');
    const $body = $('body');
    const doScroll = () => {
      if (!this.running) {
        return;
      }
      $screen.scrollTop($body.height() as number);
      setTimeout(() => {
        $screen.animate(
          { scrollTop: 0 },
          {
            duration: ($body.height() as number) / pixelsPerSecond * 1000,
            easing: 'linear',
            done: scrollDone,
          });
      }, 100);
    };
    const scrollDone = () => {
      $screen.stop();
      setTimeout(() => this.run(), postWaitSeconds * 1000);
    };
    $screen.scrollTop($body.height() as number);
    setTimeout(doScroll, preWaitSeconds * 1000);
  }

  render() {
    return null;
  }
}

function AutoScrollerSelector({ enabled }: { enabled: boolean }) {
  return enabled ? <AutoScrollerImpl /> : <div />
}

function mapStateToProps({ settings }: { settings: { autoscroll: boolean } }) {
  return { enabled: settings.autoscroll };
}

const AutoScroller = connect(mapStateToProps)(AutoScrollerSelector);

export default AutoScroller;
