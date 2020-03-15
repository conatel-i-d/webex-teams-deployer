import { createSlice, createAction } from '@reduxjs/toolkit';
import { combineEpics, ofType } from 'redux-observable';
import { from } from 'rxjs';
import { switchMap, tap, ignoreElements } from 'rxjs/operators';
/**
 * SLICE
 */
var slice = createSlice({
  name: 'app',
  initialState: {
    ready: false,
    apiKey: undefined,
  },
  reducers: {
    setApiKey(state, { payload }) {
      if (payload === undefined || payload === null || payload === "null") return state;
      state.apiKey = payload;
    },
    ready(state) {
      state.ready = true;
    },
  }
});
/**
 * ACTIONS
 */
export var { setApiKey, ready } = slice.actions;
export var init = createAction('app/init');
/**
 * SELECTORS
 */
export var readySelector = state => state.app.ready;
export var apiKeySelector = state => state.app.apiKey;
/**
 * EPICS
 */
var initEpic = action$ => action$.pipe(
  ofType(init.toString()),
  switchMap(() => from([
    setApiKey(localStorage.getItem('apiKey')),
    ready(),
  ]))
);

var saveApiKeyEpic = action$ => action$.pipe(
  ofType(setApiKey.toString()),
  tap(({payload}) => window.localStorage.setItem('apiKey', payload)),
  ignoreElements(),
);

export var epic = combineEpics(initEpic, saveApiKeyEpic);
/**
 * DEFAULT EXPORT
 */
export default slice.reducer;
