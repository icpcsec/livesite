import { combineReducers } from 'redux';

import standings from './standings';
import teams from './teams';

const reducer = combineReducers({
  standings,
  teams,
});

export default reducer;
