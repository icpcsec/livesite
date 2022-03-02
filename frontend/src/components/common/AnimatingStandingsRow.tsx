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
import { StandingsEntry } from '../../data';
import { TimerSet } from '../../utils';

type BaseProps = {
  entry: StandingsEntry;
  className: string;
};

type Props<ComponentProps> = {
  index: number;
  revealMode?: boolean;
} & ComponentProps;

type State = {
  rankHidden: boolean;
  newSolved: boolean;
};

export function createAnimatingStandingsRow<ComponentProps extends BaseProps>(
  Component: React.ComponentType<ComponentProps>
) {
  return class AnimatingStandingsRow extends React.Component<
    Props<ComponentProps>,
    State
  > {
    readonly state: State = {
      rankHidden: false,
      newSolved: false,
    };
    private readonly timers = new TimerSet();

    private animateForNewSolve() {
      this.setState({ rankHidden: true, newSolved: true });
      this.timers.setTimeout(
        () => {
          this.setState({ newSolved: false });
        },
        this.props.revealMode ? 4000 : 9000
      );
      this.timers.setTimeout(() => {
        this.setState({ rankHidden: false });
      }, 4000);
    }

    componentDidUpdate(prevProps: Props<ComponentProps>) {
      if (this.props.entry.solved !== prevProps.entry.solved) {
        this.animateForNewSolve();
      }
    }

    componentWillUnmount() {
      this.timers.clearTimeouts();
    }

    render() {
      const newProps = {
        ...this.props,
        className: `${this.props.className} ${
          this.state.newSolved ? 'new-solved' : ''
        }`,
        entry: {
          ...this.props.entry,
          rank: this.state.rankHidden ? '...' : this.props.entry.rank,
        },
      };
      // Wrap in <div> since AnimatingTable can manipulate it.
      return (
        <div
          data-key={newProps.entry.teamId}
          style={{ position: 'relative', zIndex: 9999 - newProps.index }}
        >
          <Component {...newProps} />
        </div>
      );
    }
  };
}
