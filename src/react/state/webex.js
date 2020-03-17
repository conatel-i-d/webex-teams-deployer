import { createSlice, createAction } from '@reduxjs/toolkit';
import { ofType, combineEpics } from 'redux-observable';
import { map, switchMap, take, takeUntil, catchError, startWith, mapTo } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
import { of, concat, from, zip } from 'rxjs';
import find from 'lodash/find';
import pick from 'lodash/pick';
import get from 'lodash/get';
/** CONSTANTS */
var API = 'https://api.ciscospark.com/v1/';
var GET = 'GET';
var POST = 'POST';
var PRIVATE_ROOM = 'Docentes';
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
export var requestDone = createAction('webex/request/done');
export var requestChain = createAction('webex/request/chain');
export var createAllTeams = createAction('webex/createAllTeams');
export var createTeam = createAction('webex/createTeam');
export var createTeamSuccess = createAction('webex/createTeamSuccess');
export var createTeamDone = createAction('webex/createTeamDone');
export var createTeamMembershipSuccess = createAction('webex/createTeamMembership/success');
export var createTeamMembershipError = createAction('webex/createTeamMembership/error');
export var createTeamMembershipsSuccess = createAction('webex/createTeamMemberships/success');
export var createTeamPrivateRoomSuccess = createAction('webex/createTeamPrivateRoom/success');
export var createTeamPrivateRoomError = createAction('webex/createTeamPrivateRoom/error');
export var createTeamPrivateRoomMembershipSuccess = createAction('webex/createTeamPrivateRoomMembership/success');
export var createTeamPrivateRoomMembershipError = createAction('webex/createTeamPrivateRoomMembership/error');
export var createTeamPrivateRoomMembershipsSuccess = createAction('webex/createTeamPrivateRoomMemberships/success');
export var refreshAll = createAction('webex/refreshAll');
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

var createAllTeamsEpic = (action$) => action$.pipe(
  ofType(createAllTeams.toString()),
  switchMap(({payload}) => {
    var courses = payload.filter(course => course.id === undefined);
    var courses$ = from(courses);
    var done$ = action$.pipe(
      startWith(requestChain()),
      ofType(requestChain.toString()),
      take(courses.length)
    );
    return zip(courses$, done$).pipe(map(([course]) => createTeam(course)))
  })
);

var createTeamEpic = (action$, state$) => action$.pipe(
  ofType(createTeam.toString()),
  switchMap(({payload}) => {
    if (payload.id !== undefined || payload.isVerified === false) return of({type: null});
    return ajax$({ action$, state$,
      options: {
        url: `${API}/teams`,
        method: POST,
        body: {
          name: payload.nombre_curso
        }
      },
      success: (data) => of(createTeamSuccess({...payload, ...data, rooms: [data]})),
      error: () => createTeamDone(payload)
    })
  })
);

var createTeamMembershipsEpic = (action$, state$) => action$.pipe(
  ofType(createTeamSuccess.toString()),
  switchMap(({payload}) => (
    payload.id === undefined || payload.members === undefined || payload.members.length === 0
      ? of(createTeamDone(payload))
      : concat(...[
        ...payload.members.map(member => (
          ajax$({ action$, state$,
            options: {
              url: `${API}/team/memberships`,
              method: POST,
              body: { teamId: payload.id, personEmail: member.email, isModerator: member.P !== undefined }
            },
            success: data => of(createTeamMembershipSuccess({...data, nombre_curso: member.nombre_curso})),
            error: () => createTeamMembershipError(member)
          })
        )),
        of(createTeamMembershipsSuccess(payload))
      ]))
  )
);

var createTeamPrivateRoomEpic = (action$, state$) => action$.pipe(
  ofType(createTeamMembershipsSuccess.toString()),
  switchMap(({payload}) => (
    payload.id === undefined
      ? of(createTeamDone(payload))
      : ajax$({ action$, state$,
        options: {
          url: `${API}/rooms`,
          method: POST,
          body: { teamId: payload.id, title: PRIVATE_ROOM }
        },
        success: data => of(createTeamPrivateRoomSuccess({...payload, rooms: [data]})),
        error: () => createTeamPrivateRoomError(payload)
      })
  ))
);

var createTeamPrivateRoomMembershipsEpic = (action$, state$) => action$.pipe(
  ofType(createTeamPrivateRoomSuccess.toString()),
  switchMap(({payload}) => (
    payload.id === undefined || payload.members === undefined || payload.members.length === 0 || payload.rooms === undefined || payload.rooms.length === 0
      ? of(createTeamDone(payload))
      : concat(...[
        ...payload.members.filter(member => member.P !== undefined).map(member => (
          ajax$({ action$, state$,
            options: {
              url: `${API}/memberships`,
              method: POST,
              body: { roomId: payload.rooms[0].id, personEmail: member.email, isModerator: false }
            },
            success: () => from([
              createTeamPrivateRoomMembershipSuccess(),
              createTeamDone(payload),
            ]),
            error: () => createTeamPrivateRoomMembershipError(member)
          })
        )),
        of(createTeamPrivateRoomMembershipsSuccess(payload))
      ]))
  )
);

var refreshAllEpic = (action$, state$) => action$.pipe(
  ofType(refreshAll.toString()),
  switchMap(() => {
    var courses = Object.values(state$.value.entities.courses);
    var courses$ = from(courses);
    var done$ = action$.pipe(
      startWith(requestChain()),
      ofType(requestChain.toString()),
      take(courses.length)
    );
    return zip(courses$, done$).pipe(map(([course]) => refreshTeamByName(course)));
  })
);

var refreshTeamByNameEpic = (action$, state$) => action$.pipe(
  ofType(refreshTeamByName.toString()),
  switchMap(({payload}) => (
    ajax$({ action$, state$,
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

var requestChainEpic = action$ => action$.pipe(
  ofType(
    refreshTeamByNameDone.toString(),
    createTeamDone.toString()
  ),
  mapTo(requestChain())
)

export var epic = combineEpics(
  createAllTeamsEpic,
  createTeamEpic,
  createTeamMembershipsEpic,
  createTeamPrivateRoomEpic,
  createTeamPrivateRoomMembershipsEpic,
  refreshTeamMembershipsEpic,
  refreshTeamRoomsEpic,
  refreshTeamByNameEpic,
  refreshAllEpic,
  requestChainEpic,
);
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
          requestError(err),
          error(err)
        ]);
      })
    ),
    of(requestDone()),
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