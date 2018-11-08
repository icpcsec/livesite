import { combineReducers } from 'redux';

import {deriveEvents} from './events';
import feeds from './feeds';
import reveal from './reveal';
import settings from './settings';

const reducer = deriveEvents(combineReducers({
  feeds,
  reveal,
  settings,
}));

export default reducer;
