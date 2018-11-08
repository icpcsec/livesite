import applyPartialUpdate from 'immutability-helper';

const DEFAULT = {
  contest: {
    title: null,
    times: null,
  },
  standings: {
    problems: [],
    entries: [],
  },
  teams: {},
  loaded: new Set(),
};

const feeds = (state = DEFAULT, action) => {
  if (action.type === 'UPDATE_FEEDS') {
    state = applyPartialUpdate(state, action.update);
    const newLoaded = new Set(state.loaded);
    for (const name in action.update) {
      if (action.update.hasOwnProperty(name)) {
        newLoaded.add(name);
      }
    }
    state = applyPartialUpdate(state, {loaded: {$set: newLoaded}});
  }
  return state;
};

export default feeds;
