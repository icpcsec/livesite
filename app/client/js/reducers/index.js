import { combineReducers } from 'redux';

import contest from './contest';
import loaded from './loaded';
import ratings from './ratings';
import settings from './settings';
import standings from './standings';
import streaming from './streaming';
import teams from './teams';

const reducer = combineReducers({
  contest,
  loaded,
  ratings,
  settings,
  standings,
  streaming,
  teams,
});

export default reducer;
