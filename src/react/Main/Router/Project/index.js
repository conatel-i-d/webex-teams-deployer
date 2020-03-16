import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Stack,
  Button,
} from '@chakra-ui/core'

import Course from './Course.js';
import { coursesSelector, loadCourses, refreshAll, isRefreshingAllSelector } from '../../../state/courses.js';

function Project() {
  var dispatch = useDispatch();
  var courses = useSelector(coursesSelector);
  var isRefreshingAll = useSelector(isRefreshingAllSelector)

  var handleOnLoadCourses = React.useCallback(() => (
    dispatch(loadCourses())
  ), [dispatch]);

  var handleOnRefreshAllCourses = React.useCallback(() => (
    dispatch(refreshAll())
  ), [dispatch]);

  return (
    <Stack p="1em" spacing={8}>
      <Stack isInline>
        <Button onClick={handleOnLoadCourses}>Cargar cursos</Button>
        <Button isLoading={isRefreshingAll} isDisabled={courses.length === 0} variantColor="blue" onClick={handleOnRefreshAllCourses}>Veríficar Cursos</Button>
      </Stack>
      {courses.map((course, index) => (
        <Course key={`course-${index}`} course={course} />
      ))}
    </Stack>
  )
}

export default Project;