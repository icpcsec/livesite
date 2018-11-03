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

export class CancelableCallbacks {
  constructor() {
    this.callbacks_ = [];
  }

  wrap(f) {
    const callback = (...args) => {
      if (!callback.canceled) {
        f(...args);
      }
    };
    callback.canceled = false;
    this.callbacks_.push(callback);
    return callback;
  }

  cancelAll() {
    for (const callback of this.callbacks_) {
      callback.canceled = true;
    }
    this.callbacks_ = [];
  }
}
