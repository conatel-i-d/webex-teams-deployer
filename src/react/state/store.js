import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { createEpicMiddleware, combineEpics } from 'redux-observable';
import appReducer, { epic as appEpic } from './app.js';
import coursesReducer, { epic as coursesEpic } from './courses.js';

var epicMiddleware = createEpicMiddleware();

var store = configureStore({
  reducer: {
    app: appReducer,
    courses: coursesReducer,
  },
  middleware: [ epicMiddleware, ...getDefaultMiddleware() ],
});

epicMiddleware.run(combineEpics(
  appEpic,
  coursesEpic
));

export default store;