import applyPartialUpdate from 'immutability-helper';

const DEFAULT_REVEAL = {
  reveal: { entriesList: [[]], problems: [] },
  step: 0,
};

const reveal = (reveal = DEFAULT_REVEAL, action) => {
  if (action.type === 'SET_REVEAL_STEP') {
    return applyPartialUpdate(reveal, { step: { $set: action.step }});
  } else if (action.type === 'SET_REVEAL_DATA') {
    return { reveal: action.reveal, step: 0 };
  }
  return reveal;
};

export default reveal;
