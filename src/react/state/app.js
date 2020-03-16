import { createSlice, createAction, createSelector } from '@reduxjs/toolkit';
import { combineEpics, ofType } from 'redux-observable';
import { from } from 'rxjs';
import { switchMap, tap, ignoreElements } from 'rxjs/operators';
/**
 * CONSTANTS
 */
var LOCAL_STORED_KEYS = ['apiKey', 'folder', 'coursesFileName', 'professorsFileName', 'studentsFileName'];
/**
 * SLICE
 */
var slice = createSlice({
  name: 'app',
  initialState: {
    ready: false,
    apiKey: undefined,
    folder: undefined,
    coursesFileName: '',
    professorsFileName: '',
    studentsFileName: '',
  },
  reducers: {
    setApp(state, { payload }) {
      return { ...state, ...payload };
    },
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
export var { setApp, setApiKey, setFolder, ready } = slice.actions;
export var init = createAction('app/init');
/**
 * SELECTORS
 */
export var readySelector = state => state.app.ready;
export var appSelector = state => state.app;
export var settingsSelector = createSelector(appSelector, (app) => ({
  ...app,
  ready: undefined,
}));
/**
 * EPICS
 */
var initEpic = action$ => action$.pipe(
  ofType(init.toString()),
  switchMap(() => from([
    setApp(LOCAL_STORED_KEYS.reduce((acc, key) => ({
      ...acc,
      [key]: localStorageGetItem(key),
    }), {})),
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

var saveStateEpic = action$ => action$.pipe(
  ofType(setApp.toString()),
  tap(({payload}) => Object.entries(payload).forEach(([key, value]) =>
    window.localStorage.setItem(key, value)
  )),
  ignoreElements(),
)

export var epic = combineEpics(initEpic, saveStateEpic, saveApiKeyEpic, saveFolderEpic);
/**
 * FUNCTIONS
 */
function localStorageGetItem(key) {
  var result = window.localStorage.getItem(key);
  return result === null || result === 'null' ? '' : result;
}
/**
 * DEFAULT EXPORT
 */
export default slice.reducer;
