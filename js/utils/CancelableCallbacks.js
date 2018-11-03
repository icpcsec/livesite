class CancelableCallbacks {
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

export default CancelableCallbacks;
