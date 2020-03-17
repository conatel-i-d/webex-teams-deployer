import React from 'react';
import {
  Text
} from '@chakra-ui/core';

import { titleCase } from '../../../modules/utils.js';

function Member({ member }) {
  var color = member.id !== undefined ? 'green.500' : ''

  return (
    <>
      <Text color={ color } w="100%" margin="0" borderBottom="1px solid #E2E8F0">{member.codigo_persona}</Text>
      <Text color={ color } w="100%" margin="0" borderBottom="1px solid #E2E8F0">{member.email}</Text>
      <Text color={ color } w="100%" margin="0" borderBottom="1px solid #E2E8F0">{titleCase(member.primer_apellido + ' ' + member.segundo_apellido)}</Text>
      <Text color={ color } w="100%" textAlign="center" margin="0" borderBottom="1px solid #E2E8F0">{member.P ? 'Moderador' : 'Estudiante'}</Text>
    </>
  );
}

export default Member;