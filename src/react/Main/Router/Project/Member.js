import React from 'react';
import {
  Text
} from '@chakra-ui/core';

import { titleCase } from '../../../modules/utils.js';

function Member({ member }) {
  return (
    <>
      <Text w="100%" margin="0" borderBottom="1px solid #E2E8F0">{member.email}</Text>
      <Text w="100%" margin="0" borderBottom="1px solid #E2E8F0">{titleCase(member.name)}</Text>
      <Text w="100%" textAlign="center" margin="0" borderBottom="1px solid #E2E8F0">{member.type}</Text>
    </>
  );
}

export default Member;