import React from 'react';
import { useSelector } from 'react-redux';
import {
  Stack,
} from '@chakra-ui/core'

import Course from './Course.js';
import { coursesSelector } from '../../../state/courses.js';

function Project() {
  var courses = useSelector(coursesSelector);

  return (
    <Stack p="1em" spacing={8}>
      {courses.map((course, index) => (
        <Course key={`course-${index}`} course={course} />
      ))}
    </Stack>
  )
}

export default Project;