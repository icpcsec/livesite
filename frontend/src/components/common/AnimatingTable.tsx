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

import { TimerSet } from '../../utils';

type AnimatingTableProps = {
  delay?: number;
};

type AnimatingTableSnapshot = {
  lastKeyOrder: string[];
  lastKeyToOffsetTop: Map<string, number>;
  // TODO - this is a workaround to fix scrolling position sometimes moves.
  scrollPos: number;
};

export default class AnimatingTable extends React.Component<
  AnimatingTableProps,
  {},
  AnimatingTableSnapshot
> {
  private readonly ref = React.createRef<HTMLDivElement>();
  private readonly timers = new TimerSet();
  private readonly cancels: (() => void)[] = [];

  getSnapshotBeforeUpdate(): AnimatingTableSnapshot {
    const rows = Array.from(this.ref.current!.children) as HTMLElement[];

    // Record the previous row positions.
    const lastKeyOrder = [];
    const lastKeyToOffsetTop = new Map();
    for (const row of rows) {
      lastKeyOrder.push(row.dataset.key!);
      lastKeyToOffsetTop.set(row.dataset.key!, row.offsetTop);
    }
    const scrollPos = document.documentElement.scrollTop;
    return { lastKeyOrder, lastKeyToOffsetTop, scrollPos };
  }

  componentDidUpdate(
    prevProps: AnimatingTableProps,
    prevState: unknown,
    snapshot: AnimatingTableSnapshot
  ) {
    const { delay = 1000 } = this.props;
    const { lastKeyOrder, lastKeyToOffsetTop, scrollPos } = snapshot;
    const rows = Array.from(this.ref.current!.children) as HTMLElement[];

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

    // TODO - this is a workaround to fix scrolling position sometimes moves.
    if (scrollPos) {
      document.documentElement.scrollTop = scrollPos;
    }

    // Cancel all animations.
    this.timers.clearTimeouts();
    for (const cancel of this.cancels.splice(0)) {
      cancel();
    }
    rows.forEach((row) => {
      row.classList.remove('animate-table-start', 'animate-table-active');
      row.style.removeProperty('transform');
    });

    // Currently all rows are in the final position. Record all positions.
    const currentKeyToOffsetTop = new Map();
    for (const row of rows) {
      // The following line will cause forced relayout, but it is expected.
      currentKeyToOffsetTop.set(row.dataset.key, row.offsetTop);
    }

    // Schedule animations.
    for (const row of rows) {
      const key = row.dataset.key!;
      const currentOffsetTop = currentKeyToOffsetTop.get(key);
      const lastOffsetTop = lastKeyToOffsetTop.has(key)
        ? lastKeyToOffsetTop.get(key)
        : currentOffsetTop;
      const relativeOffsetTop = lastOffsetTop - currentOffsetTop;
      if (relativeOffsetTop !== 0) {
        const actualDelay = row.classList.contains('no-animation') ? 0 : delay;
        row.classList.add('animate-table-start');
        row.style.transform = `translate(0, ${relativeOffsetTop}px)`;
        this.timers.setTimeout(() => {
          row.classList.add('animate-table-active');
          row.style.transform = 'translate(0, 0)';
          const finish = (e: TransitionEvent) => {
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
          this.cancels.push(cancel);
        }, actualDelay);
      }
    }
  }

  componentWillUnmount() {
    this.timers.clearTimeouts();
  }

  render() {
    const { children } = this.props;
    return <div ref={this.ref}>{children}</div>;
  }
}
