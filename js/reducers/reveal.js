import applyPartialUpdate from 'immutability-helper';

const DEFAULT_REVEAL = {
  standingsList: [[]],
  standingsIndex: 0,
};

const reveal = (reveal = DEFAULT_REVEAL, action) => {
  if (action.type === 'SET_REVEAL_STANDINGS_INDEX') {
    return applyPartialUpdate(reveal, { standingsIndex: { $set: action.index }});
  } else if (action.type === 'SET_REVEAL_STANDINGS_LIST') {
    return { standingsList: action.standingsList, standingsIndex: 0 };
  }
  return reveal;
};

export default reveal;
