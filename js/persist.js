import applyPartialUpdate from 'immutability-helper';

class Persist {
  constructor() {
    this.lastSettings_ = undefined;
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
    if (!window.localStorage) {
      console.log('Local storage is unavailable. Settings are not persisted.');
      return;
    }
    const serialized = localStorage.getItem('settings');
    if (serialized) {
      try {
        const settings = JSON.parse(serialized);
        store.dispatch({
          type: 'LOAD',
          update: { settings: { $set: settings } },
        });
      } catch(e) {
        // Ignore corrupted settings.
      }
    }
    store.subscribe(() => this.onStateChanged(store));
  }

  onStateChanged(store) {
    const settings = store.getState().settings;
    if (settings !== this.lastSettings_) {
      const serialized = JSON.stringify(settings);
      try {
        localStorage.setItem('settings', serialized);
      } catch (e) {
        console.log('Failed to save settings to local storage.');
      }
      this.lastSettings_ = settings;
    }
  }
}

const createPersist = () => new Persist();

export { createPersist };
