import { createSlice, createAction } from '@reduxjs/toolkit';
import { combineEpics, ofType } from 'redux-observable';
import { mapTo } from 'rxjs/operators';
/**
 * SLICE
 */
var slice = createSlice({
  name: 'courses',
  initialState: {
    count: 0,
  },
  reducers: {
    pong(state) {
      state.count = state.count + 1;
    },
  }
});
/**
 * CUSTOM ACTIONS
 */
export var ping = createAction('courses/ping');
/**
 * EPICS
 */
var pingEpic = action$ => action$.pipe(
  ofType(ping.toString()),
  mapTo(slice.actions.pong())
);

export var epic = combineEpics(pingEpic);
/**
 * EXPORTS
 */
export var { pong } = slice.actions;

export default slice.reducer;
