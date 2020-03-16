import { createSlice, createAction } from '@reduxjs/toolkit';
import { combineEpics, ofType } from 'redux-observable';
import { mapTo } from 'rxjs/operators';
import range from 'lodash/range';
import { LoremIpsum } from "lorem-ipsum";
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
/**
 * SLICE
 */
var slice = createSlice({
  name: 'courses',
  initialState: initialState(),
  reducers: {
    pong(state) {
      state.count = state.count + 1;
    },
  }
});
/**
 * CUSTOM ACTIONS
 */
export var ping = createAction('courses/ping');
/**
 * SELECTORS
 */
export var coursesSelector = state => state.courses;
/**
 * EPICS
 */
var pingEpic = action$ => action$.pipe(
  ofType(ping.toString()),
  mapTo(slice.actions.pong())
);

export var epic = combineEpics(pingEpic);
/**
 * FUNCTIONS
 */
function initialState(courses = 1000) {
  return range(courses).map(() => ({
    year: 2020,
    faculty: oneOf(FACULTIES),
    name: lorem.generateWords(randomInt(2, 6)),
    members: range(randomInt(5, 30)).map(() => ({
      name: randomName(),
      email: randomEmail(),
    }))
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
export var { pong } = slice.actions;

export default slice.reducer;
