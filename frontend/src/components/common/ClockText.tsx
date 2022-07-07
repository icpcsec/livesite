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

import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { sprintf } from 'sprintf-js';
import { ContestTimes, State } from '../../data';

function formatClock(times: ContestTimes): string {
  const { start = 0, end = 0, scale = 1 } = times;
  const now = new Date().getTime() / 1000;
  const delta = Math.max(end, now) - Math.max(start, now);
  const deltaScaled = delta * scale;
  return sprintf(
    '%d:%02d:%02d',
    Math.floor(deltaScaled / 60 / 60),
    Math.floor(deltaScaled / 60) % 60,
    Math.floor(deltaScaled) % 60
  );
}

export function ClockTextImpl({ times }: { times: ContestTimes }) {
  const [text, setText] = useState(() => formatClock(times));
  useEffect(() => {
    const { scale = 1 } = times;
    const updateInterval = Math.max(1000 / scale, 100);
    const timer = window.setInterval(
      () => setText(formatClock(times)),
      updateInterval
    );
    return () => window.clearInterval(timer);
  }, [times]);
  return <span>{text}</span>;
}

function mapStateToProps({
  feeds: {
    contest: { times },
  },
}: State) {
  return { times };
}

const ClockText = connect(mapStateToProps)(ClockTextImpl);

export default ClockText;
