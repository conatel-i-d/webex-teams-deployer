import { createSlice, createAction, createSelector } from '@reduxjs/toolkit';
import { combineEpics, ofType } from 'redux-observable';
import { switchMap, map, takeUntil, catchError } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
import { of, from, } from 'rxjs';
/**
 * SLICE
 */
var slice = createSlice({
  name: 'playground',
  initialState: {
    statusCode: '',
    data: '',
    loading: false,
    entity: 'teams',
    entityId: '',
    errorMessage: '',
  },
  reducers: {
    setState(state, { payload }) {
      return {
        ...state,
        ...payload,
      }
    },
    removeError(state) {
      state.errorMessage = '';
    },
    requestSent(state) {
      state.loading = true;
      state.errorMessage = '';
    },
    requestSuccess(state, { payload: { statusCode, data } }) {
      state.statusCode = statusCode;
      state.data = data;
      state.loading = false;
    },
    requestError(state, { payload }) {
      state.errorMessage = payload;
      state.loading = false;
      state.error = false
    }
  }
});
/**
 * ACTIONS
 */
export var { setState, removeError, requestSent, requestSuccess, requestError } = slice.actions;
export var request = createAction('playground/request');
export var cancel = createAction('playground/cancel');
/**
 * SELECTORS
 */
export var stateSelector = state => state.playground;
export var entitySelector = state => state.playground.entity;
export var entityIdSelector = state => state.playground.entityId;
export var urlSelector = createSelector(entitySelector, entityIdSelector, (entity, entityId) => 
  createUrl(entity, entityId)
);
/**
 * EPICS
 */
var requestEpic = (action$, state$) => action$.pipe(
  ofType(request.toString()),
  switchMap(({ payload: { entity, entityId, method } }) => (
    ajax({
      url: createUrl(entity, entityId),
      method,
      headers: {
        'Authorization': 'Bearer ' + state$.value.app.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    }).pipe(
      takeUntil(action$.pipe(ofType(cancel.toString()))),
      map((res) => requestSuccess({
        statusCode: res.status,
        data: res.response
      })),
      catchError((err) => of(requestError(err.errorMessage)))
    )
  )),
);

export var epic = combineEpics(requestEpic);
/**
 * FUNCTIONS
 */
function createUrl(entity, entityId) {
  return `https://api.ciscospark.com/v1/${entity}${entityId !== '' ? `/${entityId}` : ''}`
}
/**
 * DEFAULT EXPORT
 */
export default slice.reducer;