export class TimerSet {
  constructor() {
    this.timers_ = new Set();
  }

  setTimeout(callback, timeout) {
    const timer = setTimeout(() => {
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
