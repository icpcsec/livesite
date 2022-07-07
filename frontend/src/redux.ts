import { composeWithDevTools } from '@redux-devtools/extension';
import { createSelectorHook, useDispatch } from 'react-redux';
import {
  AnyAction,
  applyMiddleware,
  createStore,
  Dispatch,
  Store,
} from 'redux';
import { load, save } from 'redux-localstorage-simple';
import { Contest, FeedName, Standings, StandingsHistory, Team } from './data';
import reducer from './reducers';

export type AppState = {
  broadcast: {
    signedIn: boolean;
    view: 'none' | 'normal' | 'detailed' | 'problems';
  };
  feeds: {
    contest: Contest;
    standings: Standings;
    teams: Record<string, Team>;
    loaded: Set<FeedName>;
  };
  reveal: {
    reveal: StandingsHistory;
    step: number;
  };
  settings: {
    pinnedTeamIds: string[];
    invertColor: boolean;
    autoscroll: boolean;
  };
};

export type AppAction = AnyAction; // TODO: Use a concrete type.
export type AppStore = Store<AppState, AppAction>;
export type AppDispatch = Dispatch<AppAction>;

export function createAppStore(): AppStore {
  const persistOptions = {
    states: ['settings'],
  };
  return createStore(
    reducer,
    load(persistOptions),
    composeWithDevTools(applyMiddleware(save(persistOptions)))
  );
}

export const useAppSelector = createSelectorHook<AppState>();
export const useAppDispatch = () => useDispatch<AppDispatch>();
