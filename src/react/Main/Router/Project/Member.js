import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Text,
  Flex,
  IconButton,
} from '@chakra-ui/core';

import { titleCase } from '../../../modules/utils.js';
import { isCreatingSelector, isRefreshingSelector } from '../../../state/flags.js';
import { createTeamMembership } from '../../../state/webex.js';

function Member({ member }) {
  var dispatch = useDispatch();
  var color = member.id !== undefined ? 'green.500' : ''
  var isRefreshing = useSelector(isRefreshingSelector);
  var isCreating = useSelector(isCreatingSelector);

  var handleOnCreateTeamMembership = React.useCallback((e) => {
    e.stopPropagation();
    dispatch(createTeamMembership(member));
  }, [dispatch, member]);

  return (
    <>
      <Text color={ color } w="100%" margin="0" borderBottom="1px solid #E2E8F0">{member.codigo_persona}</Text>
      <Text color={ color } w="100%" margin="0" borderBottom="1px solid #E2E8F0">{member.email}</Text>
      <Text color={ color } w="100%" margin="0" borderBottom="1px solid #E2E8F0">{titleCase(member.primer_apellido + ' ' + member.primer_nombre)}</Text>
      <Text color={ color } w="100%" textAlign="center" margin="0" borderBottom="1px solid #E2E8F0">{member.P ? 'Moderador' : 'Estudiante'}</Text>
      <Flex justify="center" align="center" borderBottom="1px solid #E2E8F0">
        <IconButton variant="outline" onClick={handleOnCreateTeamMembership} isLoading={isRefreshing || isCreating || member.isCreating } isDisabled={!member.isVerified || member.id !== undefined || member.isRefreshing} variantColor="orange" p="0" m="0 0.25rem" height="1.25rem" minWidth="1.25rem" fontSize="0.75rem" icon="add" size="sm"/>
      </Flex>
    </>
  );
}

export default Member;