import React from 'react';
import { useDispatch } from 'react-redux';
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
import { refresh, create } from '../../../state/courses.js';

function Course({course}) {
  var dispatch = useDispatch();
  var [isCollapseOpen, setIsCollapseOpen] = React.useState(false);

  var toggleCollapse = React.useCallback(() => (
    setIsCollapseOpen(!isCollapseOpen)
  ), [setIsCollapseOpen, isCollapseOpen]);

  var handleRefresh = React.useCallback((e) => {
    e.stopPropagation();
    dispatch(refresh(course))
  }, [dispatch, course]);

  var handleCreate = React.useCallback((e) => {
    e.stopPropagation();
    dispatch(create(course))
  }, [dispatch, course]);

  return (
    <Box p={"1em"} shadow="lg" mb="1em" border="1px solid whitesmoke" onClick={toggleCollapse} cursor="pointer">
      <Flex justify="space-between">
        <Heading
          fontSize="xl"
          margin="0 0 0.5m 0"
          color={course.isVerified === false
            ? 'blue.500'
            : course.id === undefined 
              ? 'red.500' 
              : 'green.500'}
        >
          {course.nombre_curso}
        </Heading>
        <Flex align="center">
          <IconButton isDisabled={course.id !== undefined} isLoading={course.isRefreshing || course.isCreating} onClick={handleRefresh} h="20px" w="20px" fontSize="16px" variant="outline" variantColor="teal" icon={FaRetweet} />
          <IconButton ml="0.5em" isDisabled={course.isVerified === false || course.id !== undefined} isLoading={course.isRefreshing || course.isCreating} onClick={handleCreate} h="20px" w="20px" fontSize="16px" variant="outline" variantColor="orange" icon={FaPlus} />
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
          <Grid templateRows={`repeat(${course.members.length + 1}, 1.5em)`} templateColumns="60px 1fr 1fr 100px;" gap={1}>
            <Text w="100%" margin="0" fontWeight="bold" color="gray.600" borderBottom="1px solid black">Codigo</Text>
            <Text w="100%" margin="0" fontWeight="bold" color="gray.600" borderBottom="1px solid black">Email</Text>
            <Text w="100%" margin="0" fontWeight="bold" color="gray.600" borderBottom="1px solid black">Nombre</Text>
            <Text w="100px" margin="0" fontWeight="bold" color="gray.600" borderBottom="1px solid black" textAlign="center">Tipo</Text>
            {course.members.map((member, index) => (
              <Member key={`member-${index}`} member={member} />
            ))}
          </Grid>
        </>
      </Collapse>}
    </Box>
  );
}

export default Course;