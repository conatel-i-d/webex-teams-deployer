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
    folder: undefined,
  },
  reducers: {
    setApiKey(state, { payload }) {
      if (payload === undefined || payload === null || payload === "null") return state;
      state.apiKey = payload;
    },
    setFolder(state, { payload }) {
      if (payload === undefined || payload === null || payload === "null") return state;
      state.folder = payload;
    },
    ready(state) {
      state.ready = true;
    },
  }
});
/**
 * ACTIONS
 */
export var { setApiKey, setFolder, ready } = slice.actions;
export var init = createAction('app/init');
/**
 * SELECTORS
 */
export var readySelector = state => state.app.ready;
export var apiKeySelector = state => state.app.apiKey;
export var folderSelector = state => state.app.folder;
/**
 * EPICS
 */
var initEpic = action$ => action$.pipe(
  ofType(init.toString()),
  switchMap(() => from([
    setApiKey(localStorage.getItem('apiKey')),
    setFolder(localStorage.getItem('folder')),
    ready(),
  ]))
);

var saveApiKeyEpic = action$ => action$.pipe(
  ofType(setApiKey.toString()),
  tap(({payload}) => window.localStorage.setItem('apiKey', payload)),
  ignoreElements(),
);

var saveFolderEpic = action$ => action$.pipe(
  ofType(setFolder.toString()),
  tap(({payload}) => window.localStorage.setItem('folder', payload)),
  ignoreElements(),
);

export var epic = combineEpics(initEpic, saveApiKeyEpic, saveFolderEpic);
/**
 * DEFAULT EXPORT
 */
export default slice.reducer;
