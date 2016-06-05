const loaded = (loaded = new Set(), action) => {
  if (action.type == 'MARK_LOADED') {
    const newLoaded = new Set(loaded);
    newLoaded.add(action.feed);
    return newLoaded;
  }
  return loaded;
};

export default loaded;
