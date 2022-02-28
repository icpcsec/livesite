import { composeWithDevTools } from '@redux-devtools/extension';
import { createSelectorHook, useDispatch } from 'react-redux';
import { applyMiddleware, createStore, Dispatch, Store } from 'redux';
import { load, save } from 'redux-localstorage-simple';
import { AppAction } from './actions';
import reducer, { AppState } from './reducers';

export type AppStore = Store<AppState, AppAction>;
export type AppDispatch = Dispatch<AppAction>;

export function createAppStore(): AppStore {
  const persistOptions = {
    states: ['settings'],
  };
  return createStore(
    reducer,
    load(persistOptions) as AppState | undefined,
    composeWithDevTools(applyMiddleware(save(persistOptions)))
  );
}

export const useAppSelector = createSelectorHook<AppState>();
export const useAppDispatch = () => useDispatch<AppDispatch>();
