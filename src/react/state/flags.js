import { createSlice } from '@reduxjs/toolkit';
import { ofType, combineEpics } from 'redux-observable';
import { map } from 'rxjs/operators'; 

import { itemsSelector } from './entities.js';
import {
  request,
  requestError,
  requestCancel,
  requestDone,
} from './webex.js';
/** SLICE */
var slice = createSlice({
  name: 'flags',
  initialState: {
    isRefreshing: false,
    isCreating: false,
    allVerified: false,
  },
  reducers: {
    update(state, {payload}) {
      return {...state, ...payload}
    }
  }
});
/** ACTIONS */
export var { update } = slice.actions;
/** SELECTORS */
export var isRefreshingSelector = state => state.flags.isRefreshing;
export var isCreatingSelector = state => state.flags.isCreating;
export var allVerifiedSelector = state => state.flags.allVerified;
/** EPICS */
var updateOnRequestErrorOrCancelEpic = (action$, state$) => action$.pipe(
  ofType(
    request.toString(),
    requestDone.toString(),
    requestError.toString(),
    requestCancel.toString()
  ),
  map(() => {
    var items = itemsSelector(state$.value);
    return update(items.reduce((acc, item) => ({
      isRefreshing: acc.isRefreshing === true ? true : !!item.isRefreshing,
      isCreating: acc.isCreating === true ? true : !!item.isCreating,
      allVerified: acc.isCreating === true ? true : !!item.isVerified,
    }), {
      isRefreshing: false,
      isCreating: false,
      allVerified: false,
    }));
  })
)

export var epic = combineEpics(
  updateOnRequestErrorOrCancelEpic
);
/** DEFAULT EXPORTS */
export default slice.reducer;