import applyPartialUpdate from 'immutability-helper';

const INIT_STATE = {
  loaded: new Set(),
};

const loader = (loader = INIT_STATE, action) => {
  if (action.type === 'MARK_LOADED') {
    const newLoaded = new Set(loader.loaded);
    newLoaded.add(action.feed);
    return applyPartialUpdate(loader, { loaded: { $set: newLoaded }});
  }
  return loader;
};

export default loader;
