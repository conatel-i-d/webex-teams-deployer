import { createSlice, createAction, createSelector } from '@reduxjs/toolkit';
import { combineEpics, ofType } from 'redux-observable';
import { switchMap, map, takeUntil, catchError } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
import { of, concat } from 'rxjs';
/**
 * SLICE
 */
var slice = createSlice({
  name: 'playground',
  initialState: {
    statusCode: '',
    data: '',
    loading: false,
    method: 'GET',
    body: '{}',
    query: '{}',
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
      state.data = ''
      state.errorMessage = '';
    },
    requestSuccess(state, { payload: { statusCode, data } }) {
      state.statusCode = statusCode;
      state.data = data;
      state.loading = false;
    },
    requestError(state, { payload: { message } }) {
      state.errorMessage = message;
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
export var querySelector = state => state.playground.query;
export var errorMessageSelector = state => state.playground.errorMessage;
export var dataSelector = state => state.playground.data;
export var responseSelector = createSelector(dataSelector, (data) => (
  data === '' ? '' : JSON.stringify(data, undefined, 2)
));
export var urlSelector = createSelector(entitySelector, entityIdSelector, querySelector, (entity, entityId, query) => 
  createUrl(entity, entityId, query)
);
/**
 * EPICS
 */
var requestEpic = (action$, state$) => action$.pipe(
  ofType(request.toString()),
  switchMap(({ payload: { entity, entityId, method, body, query } }) => concat(
    of(requestSent()),
    ajax({
      url: createUrl(entity, entityId, query),
      method,
      headers: {
        'Authorization': 'Bearer ' + state$.value.app.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body
    }).pipe(
      takeUntil(action$.pipe(ofType(cancel.toString()))),
      map((res) => requestSuccess({
        statusCode: res.status,
        data: res.response
      })),
      catchError(({ response }) => of(requestError(response)))
    )
  )),
);

export var epic = combineEpics(requestEpic);
/**
 * FUNCTIONS
 */
function createUrl(entity, entityId, query) {
  try {
    query = encodeQueryData(JSON.parse(query))
  } catch (e) {
    query = undefined
  }
  return `https://api.ciscospark.com/v1/${entity}${entityId !== '' ? `/${entityId}` : ''}${query ? `?${query}` : ''}`
}
function encodeQueryData(data) {
  const ret = [];
  for (let d in data)
    ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
  return ret.join('&');
}
/**
 * DEFAULT EXPORT
 */
export default slice.reducer;