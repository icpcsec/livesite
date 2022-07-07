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

export class TimerSet {
  timers_: Set<number>;

  constructor() {
    this.timers_ = new Set<number>();
  }

  setTimeout(callback: () => void, timeout: number) {
    const timer = window.setTimeout(() => {
      if (this.timers_.has(timer)) {
        this.timers_.delete(timer);
        callback();
      }
    }, timeout);
    this.timers_.add(timer);
  }

  clearTimeouts() {
    this.timers_.forEach((timer) => {
      clearTimeout(timer);
    });
    this.timers_.clear();
  }
}
