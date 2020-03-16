import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Stack,
  Flex,
  Select,
  Input,
  Code,
  Button,
} from '@chakra-ui/core'

import { stateSelector, urlSelector, setState, request } from '../../../state/playground.js';

var FORM_STYLE = {
  display: 'flex',
};

function Playground() {
  var dispatch = useDispatch();

  var state = useSelector(stateSelector);
  var url = useSelector(urlSelector);

  var handleChange = React.useCallback((key) => (e) => (
    dispatch(setState({...state, [key]: e.target.value}))
  ), [dispatch, state]);

  var handleSubmit = React.useCallback((e) => {
    e.preventDefault();
    dispatch(request(state));
  }, [dispatch, state]);

  return (
    <Stack p="1em">
      <form onSubmit={handleSubmit} style={FORM_STYLE}>
        <Select width="250px" roundedRight="0" value={state.method} onChange={handleChange('method')}>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </Select>
        <Select ml="-1px" roundedLeft="0" roundedRight="0" value={state.entity} onChange={handleChange('entity')}>
          <option value="teams">/teams</option>
        </Select>
        <Input ml="-1px" roundedLeft="0" roundedRight="0" type="text" placeholder="{entityId}" value={state.entityId} onChange={handleChange('entityId')}/>
        <Button width="150px" type="submit" roundedLeft="0">Run</Button>
      </form>
      <Flex>
      <Input
        borderLeft="none"
        borderRight="none"
        borderTop="none"
        type="text" 
        variant="flushed"
        placeholder="https://api.ciscospark.com/v1/{entity}/{entityId}"
        value={url}
        readOnly
      />
      </Flex>
      <Flex>
        <Code>{state.data}</Code>
      </Flex>
    </Stack>
  )
}

export default Playground;