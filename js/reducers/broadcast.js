import applyPartialUpdate from 'immutability-helper';

const DEFAULT = {
  signedIn: false,
  view: 'none',
};

const broadcast = (state = DEFAULT, action) => {
  if (action.type === 'UPDATE_BROADCAST') {
    state = applyPartialUpdate(state, action.update);
  }
  return state;
};

export default broadcast;
