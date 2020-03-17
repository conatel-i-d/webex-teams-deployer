import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { createEpicMiddleware, combineEpics } from 'redux-observable';
import appReducer, { epic as appEpic } from './app.js';
import coursesReducer, { epic as coursesEpic } from './courses.js';
import playgroundReducer, { epic as playgroundEpic } from './playground.js';
import entitiesReducer, { epic as entitiesEpic } from './entities.js';
import webexReducer, { epic as webexEpic } from './webex.js';

var epicMiddleware = createEpicMiddleware();

var store = configureStore({
  reducer: {
    app: appReducer,
    courses: coursesReducer,
    playground: playgroundReducer,
    entities: entitiesReducer,
    webex: webexReducer,
  },
  middleware: [ epicMiddleware, ...getDefaultMiddleware() ],
});

epicMiddleware.run(combineEpics(
  appEpic,
  coursesEpic,
  playgroundEpic,
  entitiesEpic,
  webexEpic,
));

export default store;