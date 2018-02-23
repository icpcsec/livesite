import { combineReducers } from 'redux';

import contest from './contest';
import loader from './loader';
import reveal from './reveal';
import settings from './settings';
import standings from './standings';
import teams from './teams';

const reducer = combineReducers({
  contest,
  loader,
  reveal,
  settings,
  standings,
  teams,
});

export default reducer;
