import React from 'react';
import {
  Box,
  Grid,
  Heading,
  Text,
  Collapse,
} from '@chakra-ui/core';

import Member from './Member.js';
import { titleCase } from '../../../modules/utils.js';

function Course({course}) {
  var [isCollapseOpen, setIsCollapseOpen] = React.useState(false);

  var toggleCollapse = React.useCallback(() => (
    setIsCollapseOpen(!isCollapseOpen)
  ), [setIsCollapseOpen, isCollapseOpen]);

  return (
    <Box p={"1em"} shadow="md" borderWidth="1px" onClick={toggleCollapse} cursor="pointer">
      <Heading
        fontSize="xl"
        margin="0 0 0.5m 0"
        color="blue.500"
      >
        {`${titleCase(course.name)} (${course.year})`}
      </Heading>
      <Grid templateColumns="repeat(2, 1fr)" gap={1}>
        <Text w="100%" margin="0" fontWeight="bold">{titleCase(course.faculty)}</Text>
        <Text w="100%" margin="0" textAlign="right">{`${course.members.length} Miembros`}</Text>
      </Grid>
      {isCollapseOpen && <Collapse mt="1em" isOpen={isCollapseOpen}>
        <Grid templateRows={`repeat(${course.members.length + 1}, 1.5em)`} templateColumns="1fr 1fr 100px;" gap={1}>
          <Text w="100%" margin="0" fontWeight="bold" color="gray.600" borderBottom="1px solid black">Email</Text>
          <Text w="100%" margin="0" fontWeight="bold" color="gray.600" borderBottom="1px solid black">Nombre</Text>
          <Text w="100px" margin="0" fontWeight="bold" color="gray.600" borderBottom="1px solid black" textAlign="center">Tipo</Text>
          {course.members.map((member, index) => (
            <Member key={`member-${index}`} member={member} />
          ))}
        </Grid>
      </Collapse>}
    </Box>
  );
}

export default Course;