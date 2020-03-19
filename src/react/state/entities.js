import { createSlice, createSelector } from '@reduxjs/toolkit';
import { ofType, combineEpics } from 'redux-observable';
import { normalize, schema as normalizrSchema } from 'normalizr';
import deepmerge from 'deepmerge';
import { concat } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import omit from 'lodash/omit';
import toLower from 'lodash/toLower';

import { readCSVFiles, filesSelector } from './app.js';
import { 
  refreshTeamByName,
  refreshTeamByNameSuccess,
  refreshTeamByNameDone,
  refreshTeamRoomsSuccess,
  refreshTeamMembershipsSuccess,
  createTeam,
  createTeamSuccess,
  createTeamPrivateRoomSuccess,
  createTeamMembership,
  createTeamMembershipDone,
  createTeamMembershipSuccess,
  createTeamDone,
} from './webex.js';

var parse = require('csv-parse/lib/sync');

var { fs } = window;
/** CONSTANTS */
var COURSES_COLUMNS = ['nombre_curso'];
var PROFESSORS_COLUMNS = ['nombre_curso', 'codigo_persona', 'primer_apellido', 'primer_nombre', 'email', 'P'];
var STUDENTS_COLUMNS = ['nombre_curso', 'codigo_persona', 'primer_apellido', 'primer_nombre', 'email', 'A']
var coursesSchema = new normalizrSchema.Entity('courses', {}, {
  idAttribute: 'nombre_curso'
});
var membersSchema = new normalizrSchema.Entity('members', {}, {
  idAttribute: (value) => `${value.nombre_curso || value.name}|${toLower(value.email || value.personEmail)}`
});
/** SLICE */
var slice = createSlice({
  name: 'entities',
  initialState: {
    courses: {},
    members: {},
  },
  reducers: {
    merge(state, { payload }) {
      return deepmerge(state, payload.entities);
    },
    reset() {
      return {
        courses: {},
        members: {},
      };
    }
  }
});
/** ACTIONS */
export var { merge, reset } = slice.actions;
/** SELECTORS */
export var coursesSelector = state => state.entities.courses;
export var membersSelector = state => state.entities.members;
export var itemsSelector = createSelector(
  coursesSelector,
  membersSelector,
  (courses, members) => (
    Object.entries(courses).map(([courseId, course]) => ({
      ...course,
      year: 2020,
      members: Object.values(members)
        .filter(member => member.codigo_persona !== undefined && member.nombre_curso === courseId)
        .map(member => ({
          isVerified: course.isVerified,
          isRefreshing: course.isRefreshing,
          isCreating: course.isCreating,
          teamId: course.id,
          ...member,
        }))
    }))
  )
);
/** EPICS */
var readCSVFilesEpic = (action$, state$) => action$.pipe(
  ofType(readCSVFiles.toString()),
  switchMap(() => {
    var {
      coursesFilePath,
      professorsFilePath,
      studentsFilePath,
    } = filesSelector(state$.value);
    return concat([
      reset(),
      merge(normalize(readCSVFile(coursesFilePath, COURSES_COLUMNS), [coursesSchema])),
      merge(normalize(readCSVFile(professorsFilePath, PROFESSORS_COLUMNS), [membersSchema])),
      merge(normalize(readCSVFile(studentsFilePath, STUDENTS_COLUMNS), [membersSchema])),
    ])
  }),
);

var updateCourseOnCreateTeamEpic = action$ => action$.pipe(
  ofType(createTeam.toString()),
  map(({payload}) => merge(
    normalize({
      ...omit(payload, 'members'),
      isRefreshing: false,
      isCreating: true,
      isVerified: false,
    }, coursesSchema)
  ))
);

var updateMemberOnCreateTeamMembershipEpic = action$ => action$.pipe(
  ofType(createTeamMembership.toString()),
  map(({payload}) => merge(
    normalize({...payload, isCreating: true}, membersSchema)
  ))
);

var updateMemberOnCreateTeamMembershipDoneEpic = action$ => action$.pipe(
  ofType(createTeamMembershipDone.toString()),
  map(({payload}) => merge(
    normalize({...payload, isCreating: false}, membersSchema)
  ))
);

var updateCourseOnCreateTeamSuccessEpic = action$ => action$.pipe(
  ofType(
    createTeamSuccess.toString(),
    createTeamPrivateRoomSuccess.toString()
  ),
  map(({payload}) => merge(
    normalize({
      ...omit(payload, 'members'),
    }, coursesSchema)
  ))
);

var updateMembersOnCreateSuccessEpic = action$ => action$.pipe(
  ofType(createTeamMembershipSuccess.toString()),
  map(({payload}) => merge(
    normalize({...payload, isCreating: false, isVerified: true}, membersSchema)
  ))
)

var updateCourseOnCreateTeamDoneEpic = action$ => action$.pipe(
  ofType(createTeamDone.toString()),
  map(({payload}) => merge(
    normalize({
      ...omit(payload, 'members', 'rooms'),
      isRefreshing: false,
      isCreating: false,
      isVerified: true,
    }, coursesSchema)
  ))
);

var updateCourseOnRefreshTeamByNameEpic = action$ => action$.pipe(
  ofType(refreshTeamByName.toString()),
  map(({payload}) => merge(
    normalize({
      ...omit(payload, 'members'),
      isRefreshing: true,
      isVerified: false,
    }, coursesSchema)
  ))
);

var updateCourseOnRefreshSuccessEpic = action$ => action$.pipe(
  ofType(
    refreshTeamByNameSuccess.toString(),
    refreshTeamRoomsSuccess.toString()
  ),
  map(({payload}) => merge(
    normalize({
      ...omit(payload, 'members'),
    }, coursesSchema)
  ))
);

var updateMembersOnRefreshSuccessEpic = action$ => action$.pipe(
  ofType(refreshTeamMembershipsSuccess.toString()),
  map(({payload}) => merge(
    normalize(payload.members.map(member => ({
      ...member,
      nombre_curso: payload.nombre_curso
    })), [membersSchema])
  ))
)

var updateCourseOnRefreshTeamByNameDoneEpic = action$ => action$.pipe(
  ofType(refreshTeamByNameDone.toString()),
  map(({payload}) => merge(
    normalize({
      ...omit(payload, 'members', 'rooms'),
      isRefreshing: false,
      isVerified: true,
    }, coursesSchema)
  ))
);
/** EPICS EXPORT */
export var epic = combineEpics(
  updateMemberOnCreateTeamMembershipEpic,
  updateMemberOnCreateTeamMembershipDoneEpic,
  updateCourseOnRefreshTeamByNameEpic,
  updateCourseOnRefreshSuccessEpic,
  updateCourseOnRefreshTeamByNameDoneEpic,
  updateMembersOnRefreshSuccessEpic,
  updateCourseOnCreateTeamEpic,
  updateCourseOnCreateTeamSuccessEpic,
  updateMembersOnCreateSuccessEpic,
  updateCourseOnCreateTeamDoneEpic,
  readCSVFilesEpic
);
/** FUNCTIONS */
/**
 * Reads a CSV file and returns a list of the parsed rows as objects.
 * @param {string} fileName Absolute path of the file to read.
 * @param {string[]} columns List of columns to parse.
 */
function readCSVFile(filePath, columns) {
  var result = [];
  try {
    result = parse(fs.readFileSync(filePath), {
      columns,
      skip_empty_lines: true
    });
  } catch (e) {
    console.error(e);
  }
  return result;
}
/** DEFAULT EXPORTS */
export default slice.reducer;