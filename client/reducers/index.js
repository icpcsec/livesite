import { combineReducers } from 'redux';

import standings from './standings';

const reducer = combineReducers({
  standings,
});

export default reducer;
