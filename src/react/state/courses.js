import { createSlice, createAction, createSelector } from '@reduxjs/toolkit';
import { combineEpics, ofType } from 'redux-observable';
import sortBy from 'lodash/sortBy';
import find from 'lodash/find';
import get from 'lodash/get';
import set from 'lodash/set';
import { of, concat, from } from 'rxjs';
import { switchMap, map, mergeMap, concatMap, takeUntil, catchError, delay } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
import deepmerge from 'deepmerge';
const parse = require('csv-parse/lib/sync')

var { fs } = window;
/**
 * CONSTANTS
 */
var COURSES_COLUMNS = ['nombre_curso'];
var PROFESSORS_COLUMNS = ['nombre_curso', 'codigo_persona', 'primer_apellido', 'segundo_apellido', 'email', 'P'];
var STUDENTS_COLUMNS = ['nombre_curso', 'codigo_persona', 'primer_apellido', 'segundo_apellido', 'email', 'A']
var PRIVATE_ROOM_TITLE = 'Docentes';
/**
 * SLICE
 */
var slice = createSlice({
  name: 'courses',
  initialState: {
    flags: {},
    loading: false,
    names: [],
    professors: [],
    students: [],
    errorMessage: ''
  },
  reducers: {
    setCourses(state, {payload}) {
      return {
        ...state,
        ...payload,
        flags: {},
      };
    },
    setFlags(state, { payload }) {
      state.flags = deepmerge(state.flags, payload.flags);
    },
    refreshAllCoursesIds(state, { payload }) {
      state.flags = deepmerge(state.flags, payload.flags);
      state.names = payload.names;
    },
    requestError(state, { payload }) {
      state.flags = deepmerge(state.flags, payload.flags);
      state.errorMessage = payload.message;
    },
    refreshCourseMemberId(state, { payload }) {
      state.flags = deepmerge(state.flags, payload.flags);
      var course = find(state.names, c => c.nombre_curso === payload.course.nombre_curso);
      set(course, `members["${payload.data.personEmail}"]`, payload.data);
    }
  }
});
/**
 * CUSTOM ACTIONS
 */
export var { refreshCourseMemberId, setCourses, requestError, setFlags, refreshAllCoursesIds } = slice.actions;
export var loadCourses = createAction('courses/loadCourses');
export var refresh = createAction('courses/refresh');
export var refreshSuccess = createAction('courses/refresh/success');
export var refreshRoomsSuccess = createAction('courses/refreshRooms/success');
export var refreshMembershipsSuccess = createAction('courses/refreshMemberships/success')
export var refreshAll = createAction('courses/refreshAll');
export var createAll = createAction('courses/createAll');
export var createAllSuccess = createAction('courses/createAll/success');
export var refreshAllSuccess = createAction('courses/refreshAll/success');
export var refreshAllRoomsAndMembershipsSuccess = createAction('courses/refreshAllRoomsAndMemberships/success');
export var create = createAction('courses/create');
export var createSuccess = createAction('courses/create/success');
export var createPrivateRoomSuccess = createAction('courses/createPrivateRoom/success');
export var createTeamMembershipSuccess = createAction('courses/createTeamMembership/success');
export var createTeamMembershipsSuccess = createAction('courses/createTeamMemberships/success');
export var createTeamPrivateRoomMembershipSuccess = createAction('courses/createPrivateRoomMembership/success');
export var createTeamPrivateRoomMembershipsSuccess = createAction('courses/createPrivateRoomMemberships/success');
export var cancel = createAction('courses/cancel');
/**
 * SELECTORS
 */
export var namesSelector = state => state.courses.names;
export var professorsSelector = state => state.courses.professors;
export var studentsSelector = state => state.courses.students;
export var flagsSelector = state => state.courses.flags;
export var coursesSelector = createSelector(namesSelector, professorsSelector, studentsSelector, flagsSelector, (names, professors, students, flags) => {
  var refreshingAll = get(flags, 'courses.refreshAll', false);
  var creatingAll = get(flags, 'courses.createAll', false);
  var allVerified = get(flags, 'courses.allVerified', false);
  return names.map((course) => ({
    id: course.id,
    nombre_curso: course.nombre_curso,
    year: 2020,
    rooms: course.rooms,
    isVerified: allVerified || get(flags, `courses.${ course.nombre_curso }.verified`, false),
    isRefreshing: refreshingAll || get(flags, `courses.${ course.nombre_curso }.refresh`, false),
    isCreating: creatingAll || get(flags, `courses.${ course.nombre_curso }.create`, false),
    members: [
      ...professors
        .filter(professor => professor.nombre_curso === course.nombre_curso)
        .map(professor => ({...professor, ...get(course, `members["${professor.email}"]`, {})})),
      ...students
        .filter(student => student.nombre_curso === course.nombre_curso)
        .map(student => ({...student, ...get(course, `members["${student.email}"]`, {})}))
    ]
  }))
});
export var isRefreshingAllSelector = state => get(state, 'courses.flags.courses.refreshAll', false);
export var isCreatingAllSelector = state => get(state, 'courses.flags.courses.createAll', false);
export var allVerifiedSelector = state => get(state, 'courses.flags.courses.allVerified', false);
/**
 * EPICS
 */
var refreshAllEpic = (action$, state$) => action$.pipe(
  ofType(refreshAll.toString()),
  mergeMap(() => refreshAllAjax$(action$, state$)),
);

var createAllEpic = (action$, state$) => action$.pipe(
  ofType(createAll.toString()),
  switchMap(({payload}) => {
    var allVerified = get(state$.value, 'courses.flags.courses.allVerified', false);
    if (allVerified === false) return of({type: null});
    return concat(...[
      of(setFlags({ flags: { courses: { createAll: true } } })),
      ...payload
        .filter(course => course.id === undefined)
        .map(course => of(create(course)).pipe(delay(5000))),
      of(setFlags({ flags: { courses: { createAll: false } } })),
      of(createAllSuccess(payload))
    ]);
  }),
)

var refreshAllRoomsAndMembershipsEpic = (action$) => action$.pipe(
  ofType(refreshAllSuccess.toString()),
  switchMap(({payload}) => concat(
    ...payload
      .filter(course => course.id !== undefined)
      .map(course => of(refresh(course)).pipe(delay(1000))),
    of(setFlags({ flags: { courses: { refreshAll: false, allVerified: true} } })),
    of(refreshAllRoomsAndMembershipsSuccess(payload))
  )),
  
);

var refreshEpic = (action$, state$) => action$.pipe(
  ofType(refresh.toString()),
  concatMap(({payload}) => {
    return refreshAjax$(action$, state$, payload)
  }),
);

var refreshRoomsEpic = (action$, state$) => action$.pipe(
  ofType(refreshSuccess.toString()),
  switchMap(({payload}) => {
    if (payload.id === undefined) {
      return of(setFlags({ flags: { courses: { [payload.nombre_curso]: { refresh: false, verified: true } } }  }))
    }
    return webexAjax({
      state: state$.value,
      entity: 'rooms',
      method: 'GET',
      query: {
        teamId: payload.id
      },
      success({ data }) {
        return from([
          refreshAllCoursesIds({
            names: state$.value.courses.names.map(course => {
              return course.nombre_curso === payload.name
                ? { ...course, rooms: data.items }
                : course;
            }),
            flags: {} 
          }),
          refreshRoomsSuccess({...payload, rooms: data.items})
        ]);
      },
      error: (error) => requestError({ 
        ...error, 
        flags: { courses: { [payload.name]: { rooms: { [PRIVATE_ROOM_TITLE]: false } } } } 
      }),
      cancel: () => takeUntil(action$.pipe(ofType(cancel.toString()))),
      request: () => ({type: null}),
    })
  })
);

var refreshMembershipsEpic = (action$, state$) => action$.pipe(
  ofType(refreshRoomsSuccess.toString()),
  switchMap(({payload}) => {
    return webexAjax({
      state: state$.value,
      entity: 'team/memberships',
      method: 'GET',
      query: {
        teamId: payload.id
      },
      success({ data }) {
        return from([
          refreshAllCoursesIds({
            names: state$.value.courses.names.map(course => {
              return course.nombre_curso === payload.name
                ? { ...course, members: data.items.reduce((acc, item) => ({
                    ...acc,
                    ["item.personEmail"]: item
                  }), {}) }
                : course;
            }),
            flags: { courses: { [payload.nombre_curso]: { refresh: false, verified: true } } } 
          }),
          refreshMembershipsSuccess({...payload, members: data.items})
        ]);
      },
      error: (error) => requestError({ 
        ...error, 
        flags: { courses: { [payload.name]: { rooms: { [PRIVATE_ROOM_TITLE]: false } } } } 
      }),
      cancel: () => takeUntil(action$.pipe(ofType(cancel.toString()))),
      request: () => ({type: null}),
    })
  })
);

var createEpic = (action$, state$) => action$.pipe(
  ofType(create.toString()),
  mergeMap(({payload}) => {
    console.log(payload.id, payload.isVerified);
    if (payload.id !== undefined) return of({type: null});
    if (payload.isVerified === false) return refreshAjax$(action$, state$, payload);
    return createAjax$(action$, state$, payload)
  }),
);

var createTeamMembershipsEpic = (action$, state$) => action$.pipe(
  ofType(createSuccess.toString()),
  mergeMap(({payload}) => {
    return concat(
      ...payload.members.map(member => {
        return webexAjax({
          state: state$.value,
          entity: 'team/memberships',
          method: 'POST',
          body: {
            personEmail: member.email,
            teamId: payload.id,
            isModerator: member.P !== undefined
          },
          success({ data }) {
            return from([
              refreshCourseMemberId({
                course: payload,
                data,
                flags: { courses: { [payload.nombre_curso]: { members: { [member.email]: { create: false } } } } } 
              }),
              createTeamMembershipSuccess(data)
            ]);
          },
          error: (error) => requestError({ 
            ...error, 
            flags: { courses: { [payload.nombre_curso]: { members: { [member.email]: { create: false } } } } }
          }),
          cancel: () => takeUntil(action$.pipe(ofType(cancel.toString()))),
          request: () => setFlags({ flags: { courses: { [payload.nombre_curso]: { members: { [member.email]: { create: true } } } } } }),
        }).pipe(delay(1000))
      }), 
      of(createTeamMembershipsSuccess(payload)
    ))
  })
);

var createPrivateRoomEpic = (action$, state$) => action$.pipe(
  ofType(createTeamMembershipsSuccess.toString()),
  mergeMap(({payload}) => {
    return webexAjax({
      state: state$.value,
      entity: 'rooms',
      method: 'POST',
      body: {
        title: PRIVATE_ROOM_TITLE,
        teamId: payload.id
      },
      success({ data }) {
        return from([
          refreshAllCoursesIds({
            names: state$.value.courses.names.map(course => {
              return course.nombre_curso === payload.name
                ? { ...course, rooms: [...get(course, 'rooms', []), data] }
                : course;
            }),
            flags: { 
              courses: { 
                [payload.name]: { 
                  rooms: { [PRIVATE_ROOM_TITLE]: false },
                  create: false,
                  verified: true,
                },
              } 
            } 
          }),
          createPrivateRoomSuccess({...payload, privateRoom: data})
        ]);
      },
      error: (error) => requestError({ 
        ...error, 
        flags: { courses: { [payload.name]: { rooms: { [PRIVATE_ROOM_TITLE]: false } } } } 
      }),
      cancel: () => takeUntil(action$.pipe(ofType(cancel.toString()))),
      request: () => setFlags({ flags: { courses: { [payload.name]: { rooms: { [PRIVATE_ROOM_TITLE]: true } } } } }),
    })
  })
);

var createTeamPrivateRoomMembershipsEpic = (action$, state$) => action$.pipe(
  ofType(createPrivateRoomSuccess.toString()),
  mergeMap(({payload}) => {
    return concat(
      ...payload.members.filter(m => m.P !== undefined).map(member => {
        return webexAjax({
          state: state$.value,
          entity: 'memberships',
          method: 'POST',
          body: {
            personEmail: member.email,
            roomId: payload.privateRoom.id,
            isModerator: false
          },
          success({ data }) {
            return from([
              refreshCourseMemberId({
                course: payload,
                data,
                flags: { courses: { [payload.nombre_curso]: { members: { [member.email]: { create: false } } } } } 
              }),
              setFlags({
                flags: { 
                  courses: { 
                    [payload.nombre_curso]: { 
                      create: false,
                      verified: true,
                    },
                  } 
                }
              }),
              createTeamPrivateRoomMembershipSuccess(data)
            ]);
          },
          error: (error) => requestError({ 
            ...error, 
            flags: { courses: { [payload.nombre_curso]: { members: { [member.email]: { create: false } } } } }
          }),
          cancel: () => takeUntil(action$.pipe(ofType(cancel.toString()))),
          request: () => setFlags({ flags: { courses: { [payload.nombre_curso]: { members: { [member.email]: { create: true } } } } } }),
        }).pipe(delay(1000))
      }), 
      of(createTeamPrivateRoomMembershipsSuccess(payload)
    ))
  })
);

var loadCoursesEpic = (action$, state$) => action$.pipe(
  ofType(loadCourses.toString()),
  map(() => {
    var coursesFileName = state$.value.app.coursesFileName;
    var professorsFileName = state$.value.app.professorsFileName;
    var studentsFileName = state$.value.app.studentsFileName;
    return slice.actions.setCourses({
      names: sortBy(readFile(coursesFileName, COURSES_COLUMNS), 'nombre_curso'),
      professors: sortBy(readFile(professorsFileName, PROFESSORS_COLUMNS), 'primer_apellido'),
      students: sortBy(readFile(studentsFileName, STUDENTS_COLUMNS), 'primer_apellido'),
    });
  })
);

export var epic = combineEpics(createAllEpic, refreshAllRoomsAndMembershipsEpic, refreshMembershipsEpic, refreshRoomsEpic, createTeamPrivateRoomMembershipsEpic, createTeamMembershipsEpic, createPrivateRoomEpic, createEpic, refreshAllEpic, refreshEpic, loadCoursesEpic);
/**
 * FUNCTIONS
 */
function readFile(fileName, columns) {
  return parse(fs.readFileSync(fileName), {
    columns,
    skip_empty_lines: true
  });
}

function createAjax$(action$, state$, payload) {
  return webexAjax({
    method: 'POST',
    entity: 'teams',
    state: state$.value,
    body: {
      name: payload.nombre_curso
    },
    request() {
      return setFlags({ flags: { courses: { [payload.nombre_curso]: { create: true } } } });
    },
    cancel() {
      return takeUntil(action$.pipe(ofType(cancel.toString())))
    },
    success({ data }) {
      return from([
        refreshAllCoursesIds({
          names: state$.value.courses.names.map(course => {
            return course.nombre_curso === payload.nombre_curso
              ? { ...course, id: data.id, rooms: [data] }
              : course;
          }),
          flags: {},
        }),
        createSuccess({ ...payload, ...data })
      ]);
    },
    error(error) {
      return requestError({
        ...error,
        flags: { courses: { [payload.nombre_curso]: { create: false } } },
      })
    },
  });
}

function refreshAjax$(action$, state$, payload) {
  return webexAjax({
    method: 'GET',
    entity: 'teams',
    state: state$.value,
    query: {
      max: 1000
    },
    request() {
      return setFlags({ flags: { courses: { [payload.nombre_curso]: { refresh: true } } } });
    },
    cancel() {
      return takeUntil(action$.pipe(ofType(cancel.toString())))
    },
    success({ data }) {
      var item = find(data.items, item => item.name === payload.nombre_curso);
      return from([
        refreshAllCoursesIds({
          names: state$.value.courses.names.map(course => {
            return item !== undefined && course.nombre_curso === payload.nombre_curso
              ? { ...course, id: item.id }
              : course;
          }),
          flags: {}
        }),
        refreshSuccess({...payload, ...item})
      ]);
    },
    error(error) {
      return requestError({
        ...error,
        flags: { courses: { [payload.nombre_curso]: { refresh: false } } },
      })
    },
  });
}

function refreshAllAjax$(action$, state$, payload) {
  return webexAjax({
    method: 'GET',
    entity: 'teams',
    state: state$.value,
    query: {
      max: 1000
    },
    request() {
      return setFlags({ flags: { courses: { refreshAll: true } } });
    },
    cancel() {
      return takeUntil(action$.pipe(ofType(cancel.toString())))
    },
    success({ data }) {
      var names = state$.value.courses.names.map(course => {
        var item = find(data.items, item => item.name === course.nombre_curso);
        return item !== undefined
          ? { ...course, id: item.id }
          : course;
      });
      return from([
        refreshAllCoursesIds({
          names,
          flags: {}
        }),
        refreshAllSuccess(names)
      ]);
    },
    error(error) {
      return requestError({
        ...error,
        flags: { courses: { refreshAll: false } },
      })
    },
  })
}

function webexAjax({
  state,
  entity,
  entityId,
  query,
  method,
  body,
  success,
  error,
  cancel,
  request,
}) {
  return concat(
    of(request()),
    ajax({
      url: createUrl(entity, entityId, query),
      method,
      headers: {
        'Authorization': 'Bearer ' + state.app.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body
    }).pipe(
      cancel(),
      switchMap((res) => success({
        statusCode: res.status,
        data: res.response
      })),
      catchError((err) => {
        console.error(err);
        return of(error({message: err.message}));
      })
    )
  );
}

function createUrl(entity, entityId, query) {
  try {
    query = encodeQueryData(query)
  } catch (e) {
    query = undefined
  }
  return `https://api.ciscospark.com/v1/${entity}${entityId !== undefined ? `/${entityId}` : ''}${query ? `?${query}` : ''}`
}

function encodeQueryData(data) {
  const ret = [];
  for (let d in data)
    ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
  return ret.join('&');
}
/**
 * EXPORTS
 */
export default slice.reducer;
