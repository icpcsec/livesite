import applyPartialUpdate from 'immutability-helper';

const DEFAULT_REVEAL = {
  entriesList: [[]],
  entriesIndex: 0,
};

const reveal = (reveal = DEFAULT_REVEAL, action) => {
  if (action.type === 'SET_REVEAL_STANDINGS_INDEX') {
    return applyPartialUpdate(reveal, { entriesIndex: { $set: action.index }});
  } else if (action.type === 'SET_REVEAL_STANDINGS_LIST') {
    return { entriesList: action.entriesList, entriesIndex: 0 };
  }
  return reveal;
};

export default reveal;
