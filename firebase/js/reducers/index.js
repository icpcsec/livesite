import { combineReducers } from 'redux';

import contest from './contest';
import loader from './loader';
import ratings from './ratings';
import reveal from './reveal';
import settings from './settings';
import standings from './standings';
import streaming from './streaming';
import teams from './teams';

const reducer = combineReducers({
  contest,
  loader,
  ratings,
  reveal,
  settings,
  standings,
  streaming,
  teams,
});

export default reducer;
