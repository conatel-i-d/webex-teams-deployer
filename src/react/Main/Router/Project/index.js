import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Stack,
  Button,
} from '@chakra-ui/core'

import Course from './Course.js';
import { coursesSelector, loadCourses } from '../../../state/courses.js';

function Project() {
  var dispatch = useDispatch();
  var courses = useSelector(coursesSelector);

  var handleOnLoadCourses = React.useCallback(() => (
    dispatch(loadCourses())
  ), [dispatch]);

  return (
    <Stack p="1em" spacing={8}>
      <Stack isInline>
        <Button variantColor="blue" onClick={handleOnLoadCourses}>Cargar cursos</Button>
      </Stack>
      {courses.map((course, index) => (
        <Course key={`course-${index}`} course={course} />
      ))}
    </Stack>
  )
}

export default Project;