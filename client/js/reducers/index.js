import { combineReducers } from 'redux';

import contest from './contest';
import loaded from './loaded';
import standings from './standings';
import teams from './teams';

const reducer = combineReducers({
  contest,
  loaded,
  standings,
  teams,
});

export default reducer;
