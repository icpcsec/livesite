import { combineReducers } from 'redux';

import contest from './contest';
import loaded from './loaded';
import settings from './settings';
import standings from './standings';
import teams from './teams';

const reducer = combineReducers({
  contest,
  loaded,
  settings,
  standings,
  teams,
});

export default reducer;
