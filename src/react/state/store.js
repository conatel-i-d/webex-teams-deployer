import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { createEpicMiddleware, combineEpics } from 'redux-observable';
import coursesReducer, { epic as coursesEpic } from './courses.js';

var epicMiddleware = createEpicMiddleware();

var store = configureStore({
  reducer: {
    courses: coursesReducer,
  },
  middleware: [ epicMiddleware, ...getDefaultMiddleware() ],
});

epicMiddleware.run(combineEpics(
  coursesEpic
));

export default store;