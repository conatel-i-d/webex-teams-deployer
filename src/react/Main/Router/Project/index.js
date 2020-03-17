import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Stack,
  Button,
  useToast,
} from '@chakra-ui/core'

import Course from './Course.js';
import { createAll, allVerifiedSelector } from '../../../state/courses.js';
import { readCSVFiles } from '../../../state/app.js';
import { itemsSelector } from '../../../state/entities.js';
import { messageSelector, refreshAll } from '../../../state/webex.js';
import { isRefreshingSelector, isCreatingSelector } from '../../../state/flags.js';

function Project() {
  var dispatch = useDispatch();
  var toast = useToast();
  
  var courses = useSelector(itemsSelector);
  var isRefreshing = useSelector(isRefreshingSelector);
  var isCreating = useSelector(isCreatingSelector);
  var allVerified = useSelector(allVerifiedSelector);
  var message = useSelector(messageSelector);

  var handleOnLoadCourses = React.useCallback(() => (
    dispatch(readCSVFiles())
  ), [dispatch]);

  var handleOnRefreshAllCourses = React.useCallback(() => (
    dispatch(refreshAll())
  ), [dispatch]);

  var handleOnCreateAllCourses = React.useCallback(() => (
    dispatch(createAll(courses))
  ), [dispatch, courses]);

  React.useEffect(() => {
    if (message === undefined) return;
    toast({
      title: "Error",
      description: message,
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  }, [message]);

  return (
    <Stack p="1em" spacing={8}>
      <Stack isInline>
        <Button isLoading={isRefreshing || isCreating} onClick={handleOnLoadCourses}>Cargar cursos</Button>
        <Button isLoading={isRefreshing} isDisabled={courses.length === 0 || isCreating} variantColor="blue" onClick={handleOnRefreshAllCourses}>Veríficar Cursos</Button>
        <Button isLoading={isCreating || isRefreshing} isDisabled={courses.length === 0 || allVerified === false} variantColor="orange" onClick={handleOnCreateAllCourses}>Crear Cursos</Button>
      </Stack>
      {courses.map((course, index) => (
        <Course key={`course-${index}`} course={course} />
      ))}
    </Stack>
  )
}

export default Project;