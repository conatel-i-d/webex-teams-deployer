import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import get from 'lodash/get';
import {
  Box,
  Grid,
  Heading,
  Text,
  Collapse,
  Flex,
  IconButton,
} from '@chakra-ui/core';
import { FaRetweet, FaPlus } from 'react-icons/fa';

import Member from './Member.js';
import { refreshTeamByName, createTeam } from '../../../state/webex.js';
import { isRefreshingSelector, isCreatingSelector } from '../../../state/flags.js';

function Course({course}) {
  var dispatch = useDispatch();
  var [isCollapseOpen, setIsCollapseOpen] = React.useState(false);

  var isRefreshing = useSelector(isRefreshingSelector);
  var isCreating = useSelector(isCreatingSelector);

  var toggleCollapse = React.useCallback(() => (
    setIsCollapseOpen(!isCollapseOpen)
  ), [setIsCollapseOpen, isCollapseOpen]);

  var handleRefresh = React.useCallback((e) => {
    e.stopPropagation();
    //dispatch(refresh(course))
    dispatch(refreshTeamByName(course));
  }, [dispatch, course]);

  var handleCreate = React.useCallback((e) => {
    e.stopPropagation();
    dispatch(createTeam(course))
  }, [dispatch, course]);

  return (
    <Box p={"1em"} shadow="lg" mb="1em" border="1px solid whitesmoke" onClick={toggleCollapse} cursor="pointer">
      <Flex justify="space-between">
        <Heading
          fontSize="xl"
          margin="0 0 0.5m 0"
          color={course.isVerified
            ? course.id === undefined 
              ? 'red.500' 
              : 'green.500'
            : 'blue.500'}
        >
          {course.nombre_curso}
        </Heading>
        <Flex align="center">
          <IconButton isDisabled={course.id !== undefined} isLoading={isRefreshing || isCreating || course.isRefreshing || course.isCreating} onClick={handleRefresh} h="20px" w="20px" fontSize="16px" variant="outline" variantColor="teal" icon={FaRetweet} />
          <IconButton ml="0.5em" isDisabled={!course.isVerified || course.id !== undefined} isLoading={isRefreshing || isCreating || course.isRefreshing || course.isCreating} onClick={handleCreate} h="20px" w="20px" fontSize="16px" variant="outline" variantColor="orange" icon={FaPlus} />
        </Flex>
      </Flex>
      <Grid templateColumns="repeat(2, 1fr)" gap={1}>
        <Text w="100%" margin="0" fontWeight="bold">{course.year}</Text>
        <Text w="100%" margin="0" textAlign="right">{`${course.members.length} Miembros`}</Text>
      </Grid>
      {isCollapseOpen && <Collapse mt="1em" isOpen={isCollapseOpen}>
        <>
          <Heading
            fontSize="sm"
            margin="0 0 0.5m 0"
            color="grey.50"
          >Miembros</Heading>
          <Grid templateRows={`repeat(${course.members.length + 1}, 1.5em)`} templateColumns="60px 1fr 1fr 100px 60px" gap={1}>
            <Text w="100%" margin="0" fontWeight="bold" color="gray.600" borderBottom="1px solid black">Codigo</Text>
            <Text w="100%" margin="0" fontWeight="bold" color="gray.600" borderBottom="1px solid black">Email</Text>
            <Text w="100%" margin="0" fontWeight="bold" color="gray.600" borderBottom="1px solid black">Nombre</Text>
            <Text w="100%" margin="0" fontWeight="bold" color="gray.600" borderBottom="1px solid black" textAlign="center">Tipo</Text>
            <Text w="100%" margin="0" fontWeight="bold" color="gray.600" borderBottom="1px solid black" textAlign="center">...</Text>
            {course.members.map((member, index) => (
              <Member key={`member-${index}`} member={member} />
            ))}
          </Grid>
          <Heading
            fontSize="sm"
            margin="0 0 0.5m 0"
            color="grey.50"
          >Rooms ({ get(course, 'rooms.length', 0) })</Heading>
          {get(course, 'rooms', []).map(room => (
            <Text h="1.5em" key={room.id} w="100%" margin="0" color="gray.600">{room.name || room.title}</Text>
          ))}
        </>
      </Collapse>}
    </Box>
  );
}

export default Course;