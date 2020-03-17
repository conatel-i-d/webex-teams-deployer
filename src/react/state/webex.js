import { createSlice, createAction } from '@reduxjs/toolkit';
import { ofType, combineEpics } from 'redux-observable';
import { switchMap, map, takeUntil, catchError } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
import { of, concat } from 'rxjs';
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
    error(_, { payload }) {
      return payload;
    }
  }
});
/** ACTIONS */
export var { error, request } = slice.actions;
export var requestCancel = createAction('webex/request/cancel');
export var requestSuccess = createAction('webex/request/success');
export var refreshTeamByName = createAction('webex/refreshTeamByName');
export var refreshTeamByNameSuccess = createAction('webex/refreshTeamByName/success');
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
        return refreshTeamByNameSuccess({...payload, ...course})
      }
    })
  ))
);

export var epic = combineEpics(refreshTeamByNameEpic);
/** FUNCTIONS */
function ajax$({state$, action$, options, success}) {
  return concat(
    of(request()),
    ajax({...options, headers: headers(state$.value)}).pipe(
      takeUntil(cancelEpic(action$)),
      map((res) => success(res.data)),
      catchError((err) => {
        console.error(err);
        return of(error(pick(err, 'message', 'name', 'status', 'response')));
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
/** DEFAULT EXPORT */
export default slice.reducer;