import { createSlice, createAction, createSelector } from '@reduxjs/toolkit';
import { combineEpics, ofType } from 'redux-observable';
import sortBy from 'lodash/sortBy';
import find from 'lodash/find';
import get from 'lodash/get';
import { of, concat } from 'rxjs';
import { map, tap, mergeMap, takeUntil, catchError } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
const parse = require('csv-parse/lib/sync')

var { fs } = window;
/**
 * CONSTANTS
 */
var COURSES_COLUMNS = ['nombre_curso'];
var PROFESSORS_COLUMNS = ['nombre_curso', 'codigo_persona', 'primer_apellido', 'segundo_apellido', 'email', 'P'];
var STUDENTS_COLUMNS = ['nombre_curso', 'codigo_persona', 'primer_apellido', 'segundo_apellido', 'email', 'A']
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
    setCourses(_, {payload}) {
      return payload;
    },
    setFlags(state, { payload }) {
      state.flags = { ...state.flags, ...payload.flags };
    },
    refreshCourseId(state, { payload }) {
      state.flags = { ...state.flags, ...payload.flags }
      if (payload.item !== undefined) {
        var { id } = payload.item;
        var { nombre_curso } = payload.course;
        state.names = state.names.map(course => {
          if (course.nombre_curso === nombre_curso)
            course.id = id;
          return course;
        });
      }
    },
    requestError(state, { payload: { message, flags } }) {
      state.errorMessage = message;
      state.flags = { ...state.flags, ...flags };
      state.error = false
    }
  }
});
/**
 * CUSTOM ACTIONS
 */
export var { setCourses, requestError, setFlags, refreshCourseId } = slice.actions;
export var loadCourses = createAction('courses/loadCourses');
export var refresh = createAction('courses/refresh');
export var cancel = createAction('courses/cancel');
/**
 * SELECTORS
 */
export var namesSelector = state => state.courses.names;
export var professorsSelector = state => state.courses.professors;
export var studentsSelector = state => state.courses.students;
export var flagsSelector = state => state.courses.flags;
export var coursesSelector = createSelector(namesSelector, professorsSelector, studentsSelector, flagsSelector, (names, professors, students, flags) => {
  return names.map(({id, nombre_curso}) => ({
    id,
    nombre_curso,
    year: 2020,
    isRefreshing: get(flags, `courses.${ nombre_curso }.refresh`),
    members: [
      ...professors.filter(professor => professor.nombre_curso === nombre_curso),
      ...students.filter(student => student.nombre_curso === nombre_curso)
    ]
  }))
})
/**
 * EPICS
 */
var refreshEpic = (action$, state$) => action$.pipe(
  ofType(refresh.toString()),
  mergeMap(({payload}) => {
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
        return refreshCourseId({
          course: payload,
          item: find(data.items, item => item.name === payload.nombre_curso),
          flags: { courses: { [payload.nombre_curso]: { refresh: false } } }
        })
      },
      error(error) {
        return requestError({
          ...error,
          flags: { courses: { [payload.nombre_curso]: { refresh: false } } },
        })
      },
    })
  }),
  tap(result => console.log(result)),
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

export var epic = combineEpics(refreshEpic, loadCoursesEpic);
/**
 * FUNCTIONS
 */
function readFile(fileName, columns) {
  return parse(fs.readFileSync(fileName), {
    columns,
    skip_empty_lines: true
  });
}

function webexAjax({state, entity, entityId, query, method, body, success, error, cancel, request}) {
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
      map((res) => success({
        statusCode: res.status,
        data: res.response
      })),
      catchError((err) => of(error(err)))
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
