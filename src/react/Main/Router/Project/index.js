import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Stack,
  Button,
} from '@chakra-ui/core'

import Course from './Course.js';
import { coursesSelector, loadCourses, refreshAll, createAll, allVerifiedSelector, isCreatingAllSelector, isRefreshingAllSelector } from '../../../state/courses.js';

function Project() {
  var dispatch = useDispatch();
  var courses = useSelector(coursesSelector);
  var isRefreshingAll = useSelector(isRefreshingAllSelector)
  var isCreatingAll = useSelector(isCreatingAllSelector)
  var allVerified = useSelector(allVerifiedSelector);

  var handleOnLoadCourses = React.useCallback(() => (
    dispatch(loadCourses())
  ), [dispatch]);

  var handleOnRefreshAllCourses = React.useCallback(() => (
    dispatch(refreshAll())
  ), [dispatch]);

  var handleOnCreateAllCourses = React.useCallback(() => (
    dispatch(createAll(courses))
  ), [dispatch, courses]);

  return (
    <Stack p="1em" spacing={8}>
      <Stack isInline>
        <Button onClick={handleOnLoadCourses}>Cargar cursos</Button>
        <Button isLoading={isRefreshingAll} isDisabled={courses.length === 0 || isCreatingAll} variantColor="blue" onClick={handleOnRefreshAllCourses}>Veríficar Cursos</Button>
        <Button isLoading={isCreatingAll} isDisabled={courses.length === 0 || allVerified === false} variantColor="orange" onClick={handleOnCreateAllCourses}>Crear Cursos</Button>
      </Stack>
      {courses.map((course, index) => (
        <Course key={`course-${index}`} course={course} />
      ))}
    </Stack>
  )
}

export default Project;