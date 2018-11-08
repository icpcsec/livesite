import { combineReducers } from 'redux';

import broadcast from './broadcast';
import {deriveEvents} from './events';
import feeds from './feeds';
import reveal from './reveal';
import settings from './settings';

const reducer = deriveEvents(combineReducers({
  broadcast,
  feeds,
  reveal,
  settings,
}));

export default reducer;
