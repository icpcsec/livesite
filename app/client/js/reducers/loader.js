import applyPartialUpdate from 'react-addons-update';

const INIT_STATE = {
  loaded: new Set(),
  realtime: null,
};

const loader = (loader = INIT_STATE, action) => {
  if (action.type == 'MARK_LOADED') {
    const newLoaded = new Set(loader.loaded);
    newLoaded.add(action.feed);
    return applyPartialUpdate(loader, { loaded: { $set: newLoaded }});
  }
  if (action.type == 'UPDATE_REALTIME') {
    return applyPartialUpdate(loader, { realtime: { $set: action.realtime }});
  }
  return loader;
};

export default loader;
