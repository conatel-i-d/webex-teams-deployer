import { createSlice, createAction, createSelector } from '@reduxjs/toolkit';
import { combineEpics, ofType } from 'redux-observable';
import range from 'lodash/range';
import sortBy from 'lodash/sortBy';
import { LoremIpsum } from "lorem-ipsum";
import { map } from 'rxjs/operators';
const parse = require('csv-parse/lib/sync')

var { fs } = window;
/**
 * CONSTANTS
 */
var lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4
  },
  wordsPerSentence: {
    max: 16,
    min: 4
  }
});

var FACULTIES = ['diseño', 'ingeniería', 'postgrados', 'ciencias sociales'];
var MEMBER_TYPES = ['P', 'A'];
var COURSES_COLUMNS = ['nombre_curso'];
var PROFESSORS_COLUMNS = ['nombre_curso', 'codigo_persona', 'primer_apellido', 'segundo_apellido', 'email', 'P'];
var STUDENTS_COLUMNS = ['nombre_curso', 'codigo_persona', 'primer_apellido', 'segundo_apellido', 'email', 'A']
/**
 * SLICE
 */
var slice = createSlice({
  name: 'courses',
  initialState: {
    loading: false,
    names: [],
    professors: [],
    students: [],
  },
  reducers: {
    setCourses(_, {payload}) {
      return payload;
    },
  }
});
/**
 * CUSTOM ACTIONS
 */
export var loadCourses = createAction('courses/loadCourses');
/**
 * SELECTORS
 */
export var namesSelector = state => state.courses.names;
export var professorsSelector = state => state.courses.professors;
export var studentsSelector = state => state.courses.students;
export var coursesSelector = createSelector(namesSelector, professorsSelector, studentsSelector, (names, professors, students) => {
  return names.map(({nombre_curso}) => ({
    nombre_curso,
    year: 2020,
    members: [
      ...professors.filter(professor => professor.nombre_curso === nombre_curso),
      ...students.filter(student => student.nombre_curso === nombre_curso)
    ]
  }))
})
/**
 * EPICS
 */
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

export var epic = combineEpics(loadCoursesEpic);
/**
 * FUNCTIONS
 */
function readFile(fileName, columns) {
  return parse(fs.readFileSync(fileName), {
    columns,
    skip_empty_lines: true
  });
}

function initialState(courses = 1000) {
  return range(courses).map(() => ({
    year: 2020,
    faculty: oneOf(FACULTIES),
    name: lorem.generateWords(randomInt(2, 6)),
    members: sortBy(range(randomInt(5, 30)).map(() => ({
      name: randomName(),
      email: randomEmail(),
      type: oneOf(MEMBER_TYPES),
    })), 'type').reverse()
  }));
}

function randomEmail() {
  var [name, lastName] = randomName().split(' ');
  var domain = lorem.generateWords(1);
  return name + '.' + lastName + '@' + domain + '.com';
}

function randomName() {
  var name = lorem.generateWords(1);
  var lastName = lorem.generateWords(1);
  return name + ' ' + lastName;
}

function randomInt(min, max) {
  var diff = max - min;
  return Math.floor(Math.random() * diff) + min;
}

function oneOf(list = []) {
  return list[randomInt(0, list.length)];
}
/**
 * EXPORTS
 */
export default slice.reducer;
