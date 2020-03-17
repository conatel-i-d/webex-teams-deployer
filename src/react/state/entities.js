import { createSlice, createSelector } from '@reduxjs/toolkit';
import { ofType, combineEpics } from 'redux-observable';
import { normalize, schema as normalizrSchema } from 'normalizr';
import deepmerge from 'deepmerge';
import { from } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

import { readCSVFiles, filesSelector } from './app.js';

var parse = require('csv-parse/lib/sync');

var { fs } = window;
/** CONSTANTS */
var COURSES_COLUMNS = ['nombre_curso'];
var PROFESSORS_COLUMNS = ['nombre_curso', 'codigo_persona', 'primer_apellido', 'segundo_apellido', 'email', 'P'];
var STUDENTS_COLUMNS = ['nombre_curso', 'codigo_persona', 'primer_apellido', 'segundo_apellido', 'email', 'A']
var coursesSchema = new normalizrSchema.Entity('courses', {}, {
  idAttribute: 'nombre_curso'
});
var membersSchema = new normalizrSchema.Entity('members', {}, {
  idAttribute: (value) => `${value.nombre_curso}|${value.email}`
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
    }
  }
});
/** ACTIONS */
export var { merge } = slice.actions;
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
        .filter(member => member.nombre_curso === courseId)
    }))
  )
);
/** EPICS */
export var readCSVFilesEpic = (action$, state$) => action$.pipe(
  ofType(readCSVFiles.toString()),
  switchMap(() => {
    var {
      coursesFilePath,
      professorsFilePath,
      studentsFilePath,
    } = filesSelector(state$.value);
    return from([
      [coursesFilePath, COURSES_COLUMNS, coursesSchema],
      [professorsFilePath, PROFESSORS_COLUMNS, membersSchema], 
      [studentsFilePath, STUDENTS_COLUMNS, membersSchema], 
    ]); 
  }),
  map(([filePath, columns, schema]) => (
    merge(normalize(readCSVFile(filePath, columns), [schema]))
  ))
);
/** EPICS EXPORT */
export var epic = combineEpics(readCSVFilesEpic);
/** FUNCTIONS */
/**
 * Reads a CSV file and returns a list of the parsed rows as objects.
 * @param {string} fileName Absolute path of the file to read.
 * @param {string[]} columns List of columns to parse.
 */
function readCSVFile(filePath, columns) {
  return parse(fs.readFileSync(filePath), {
    columns,
    skip_empty_lines: true
  });
}
/** DEFAULT EXPORTS */
export default slice.reducer;