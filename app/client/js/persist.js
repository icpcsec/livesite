import applyPartialUpdate from 'react-addons-update';

class Persist {
  constructor() {
    this._lastSettings = undefined;
  }

  createReducer(reducer) {
    return (state, action) => {
      if (action.type === 'LOAD') {
        state = applyPartialUpdate(state, action.update);
      }
      return reducer(state, action);
    };
  }

  start(store) {
    const serialized = localStorage.getItem('settings');
    if (serialized) {
      try {
        const settings = JSON.parse(serialized);
        store.dispatch({ type: 'LOAD', update: { settings: {$set: settings} } });
      } catch(e) {}
    }
    store.subscribe(() => this.onStateChanged(store));
  }

  onStateChanged(store) {
    const settings = store.getState().settings;
    if (settings !== this._lastSettings) {
      const serialized = JSON.stringify(settings);
      localStorage.setItem('settings', serialized);
      this._lastSettings = settings;
    }
  }
};

const createPersist = () => new Persist();

export { createPersist };
