import { createSlice, createAction, createSelector } from '@reduxjs/toolkit';
import { combineEpics, ofType } from 'redux-observable';
import sortBy from 'lodash/sortBy';
import find from 'lodash/find';
import get from 'lodash/get';
import { of, concat, from } from 'rxjs';
import { switchMap, map, mergeMap, takeUntil, catchError } from 'rxjs/operators';
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
      state.errorMessage = payload.message;
      state.flags = deepmerge(state.flags, payload.flags);
      console.log(payload);
    }
  }
});
/**
 * CUSTOM ACTIONS
 */
export var { setCourses, requestError, setFlags, refreshAllCoursesIds } = slice.actions;
export var loadCourses = createAction('courses/loadCourses');
export var refresh = createAction('courses/refresh');
export var refreshSuccess = createAction('courses/refresh/success');
export var refreshAll = createAction('courses/refreshAll');
export var refreshAllSuccess = createAction('courses/refreshAll/success');
export var create = createAction('courses/create');
export var createSuccess = createAction('courses/create/success');
export var createRoomsSuccess = createAction('courses/createRooms/success');
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
  return names.map(({id, nombre_curso}) => ({
    id,
    nombre_curso,
    year: 2020,
    isVerified: allVerified || get(flags, `courses.${ nombre_curso }.verified`, false),
    isRefreshing: refreshingAll || get(flags, `courses.${ nombre_curso }.refresh`, false),
    isCreating: creatingAll || get(flags, `courses.${ nombre_curso }.create`, false),
    members: [
      ...professors.filter(professor => professor.nombre_curso === nombre_curso),
      ...students.filter(student => student.nombre_curso === nombre_curso)
    ]
  }))
});
export var isRefreshingAllSelector = state => get(state, 'courses.flags.courses.refreshAll', false)
/**
 * EPICS
 */
var refreshAllEpic = (action$, state$) => action$.pipe(
  ofType(refreshAll.toString()),
  mergeMap(() => {
    return refreshAllAjax$(action$, state$)  
  }),
);

var refreshEpic = (action$, state$) => action$.pipe(
  ofType(refresh.toString()),
  mergeMap(({payload}) => {
    return refreshAjax$(action$, state$, payload)
  }),
);

var createEpic = (action$, state$) => action$.pipe(
  ofType(create.toString()),
  switchMap(({payload}) => {
    console.log(payload.id, payload.isVerified);
    if (payload.id !== undefined) return of({type: null});
    if (payload.isVerified === false) return refreshAjax$(action$, state$, payload);
    return createAjax$(action$, state$, payload)
  }),
);

var createRoomsEpic = (action$, state$) => action$.pipe(
  ofType(createSuccess.toString()),
  switchMap(({payload}) => {
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
            flags: { courses: { [payload.name]: { rooms: { [PRIVATE_ROOM_TITLE]: false } } } } 
          }),
          createRoomsSuccess()
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
)

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

export var epic = combineEpics(createRoomsEpic, createEpic, refreshAllEpic, refreshEpic, loadCoursesEpic);
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
              ? { ...course, id: data.id }
              : course;
          }),
          flags: { courses: { [payload.nombre_curso]: { create: false, verified: true } } }
        }),
        createSuccess(data)
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
          flags: { courses: { [payload.nombre_curso]: { refresh: false, verified: true } } }
        }),
        refreshSuccess()
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
      return from([
        refreshAllCoursesIds({
          names: state$.value.courses.names.map(course => {
            var item = find(data.items, item => item.name === course.nombre_curso);
            return item !== undefined
              ? { ...course, id: item.id }
              : course;
          }),
          flags: { courses: { refreshAll: false, allVerified: true} }
        }),
        refreshAllSuccess()
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
        return of(error(err));
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
