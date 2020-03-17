import { createSlice, createAction } from '@reduxjs/toolkit';
import { ofType, combineEpics } from 'redux-observable';
import { switchMap, map, takeUntil, catchError } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
import { of, concat, from } from 'rxjs';
import find from 'lodash/find';
import pick from 'lodash/pick';
import get from 'lodash/get';
/** CONSTANTS */
var API = 'https://api.ciscospark.com/v1/';
var GET = 'GET';
var POST = 'POST';
/** SLICE */
var slice = createSlice({
  name: 'webex',
  initialState: {},
  reducers: {
    request() {
      return {}
    },
    requestError(_, { payload }) {
      return payload;
    }
  }
});
/** ACTIONS */
export var { requestError, request } = slice.actions;
export var requestCancel = createAction('webex/request/cancel');
export var requestSuccess = createAction('webex/request/success');
export var refreshTeamByName = createAction('webex/refreshTeamByName');
export var refreshTeamByNameDone = createAction('webex/refreshTeamByName/done');
export var refreshTeamByNameSuccess = createAction('webex/refreshTeamByName/success');
export var refreshTeamRoomsSuccess = createAction('webex/refreshTeamRooms/success');
export var refreshTeamMembershipsSuccess = createAction('webex/refreshTeamMemberships/success');
/** SELECTORS */
export var messageSelector = state => {
  var ajaxMessage = get(state, 'webex.message', undefined);
  var responseMessage = get(state, 'webex.response.message', undefined);
  return responseMessage || ajaxMessage;
}
/** EPICS */
var cancelEpic = action$ => action$.pipe(ofType(requestCancel.toString()));

var refreshTeamByNameEpic = (action$, state$) => action$.pipe(
  ofType(refreshTeamByName.toString()),
  switchMap(({payload}) => (
    ajax$({
      action$,
      state$,
      options: {
        url: `${API}/teams`,
        method: GET,
      },
      success(data) {
        var { items = [] } = data;
        var course = find(items, item => item.name === payload.nombre_curso);
        return of(refreshTeamByNameSuccess({...payload, ...course}))
      },
      error: () => refreshTeamByNameDone(payload)
    })
  ))
);

var refreshTeamRoomsEpic = (action$, state$) => action$.pipe(
  ofType(refreshTeamByNameSuccess.toString()),
  switchMap(({payload}) => (
    payload.id === undefined
      ? of(refreshTeamByNameDone(payload))
      : ajax$({
          action$,
          state$,
          options: {
            url: `${API}/rooms?${encodeQueryData({teamId: payload.id})}`,
            method: GET,
          },
          success(data) {
            payload = {...payload, rooms: data.items };
            return of(refreshTeamRoomsSuccess(payload))
          },
          error: () => refreshTeamByNameDone(payload)
        })
  ))
)

var refreshTeamMembershipsEpic = (action$, state$) => action$.pipe(
  ofType(refreshTeamRoomsSuccess.toString()),
  switchMap(({payload}) => (
    payload.id === undefined
      ? of(refreshTeamByNameDone(payload))
      : ajax$({
          action$,
          state$,
          options: {
            url: `${API}/team/memberships?${encodeQueryData({teamId: payload.id})}`,
            method: GET,
          },
          success(data) {
            payload = {...payload, members: data.items };
            return from([
              refreshTeamMembershipsSuccess(payload),
              refreshTeamByNameDone(payload)
            ])
          },
          error: () => refreshTeamByNameDone(payload)
        })
  ))
)

export var epic = combineEpics(refreshTeamMembershipsEpic, refreshTeamRoomsEpic, refreshTeamByNameEpic);
/** FUNCTIONS */
function ajax$({state$, action$, options, success, error}) {
  return concat(
    of(request()),
    ajax({...options, headers: headers(state$.value)}).pipe(
      takeUntil(cancelEpic(action$)),
      switchMap((res) => success(res.response)),
      catchError((err) => {
        err = pick(err, 'message', 'name', 'status', 'response');
        return from([
          of(requestError(err)),
          of(error(err))
        ]);
      })
    ),
  )
}

function headers(state) {
  return {
    'Authorization': 'Bearer ' + state.app.apiKey,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}

/**
 * Encodes the data object into a valid uri query string.
 * @param {object} data Query object data to encode.
 */
function encodeQueryData(data) {
  const ret = [];
  for (let d in data)
    ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
  return ret.join('&');
}
/** DEFAULT EXPORT */
export default slice.reducer;