import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Stack,
  Flex,
  Select,
  Input,
  Button,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Textarea,
  useToast,
} from '@chakra-ui/core'

import { stateSelector, errorMessageSelector, responseSelector, urlSelector, setState, request } from '../../../state/playground.js';

var FORM_STYLE = {
  display: 'flex',
};

function Playground() {
  var dispatch = useDispatch();
  var toast = useToast();

  var state = useSelector(stateSelector);
  var url = useSelector(urlSelector);
  var response = useSelector(responseSelector);
  var errorMessage = useSelector(errorMessageSelector);

  React.useEffect(() => {
    if (errorMessage === '') return;
    toast({
      title: 'Error',
      description: errorMessage,
      status: 'error',
      duration: 9000,
      isClosable: true,
    })
  }, [toast, errorMessage]);

  React.useEffect(() => {
    if (response === '') return;
    toast({
      title: 'OK',
      description: 'Se ha completado la consulta con exito.',
      status: 'success',
      duration: 9000,
      isClosable: true,
    })
  }, [toast, response]);

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
        <Select width="300px" roundedRight="0" value={state.method} onChange={handleChange('method')}>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </Select>
        <Select ml="-1px" roundedLeft="0" roundedRight="0" value={state.entity} onChange={handleChange('entity')}>
          <option value="teams">/teams</option>
          <option value="team/memberships">/team/memberships</option>
          <option value="rooms">/rooms</option>
          <option value="memberships">/memberships</option>
        </Select>
        <Input ml="-1px" roundedLeft="0" roundedRight="0" type="text" placeholder="{entityId}" value={state.entityId} onChange={handleChange('entityId')}/>
        <Button width="150px" type="submit" roundedLeft="0" isLoading={state.loading}>Run</Button>
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
      <Tabs variant="soft-rounded" variantColor="gray">
        <TabList mb="0.5em">
          <Tab mr="0.5em">Respuesta</Tab>
          <Tab mr="0.5em" isDisabled={state.method === 'GET' || state.method === 'DELETE'}>Body</Tab>
          <Tab>Query</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Textarea
              height="calc(100vh - 15.5em)"
              overflow="auto"
              wordWrap="normal"
              whiteSpace="pre"
              resize="vertical"
              fontFamily="monospace"
              p="1em"
              readOnly
              value={response} 
            />
          </TabPanel>
          <TabPanel>
            <Textarea 
              height="calc(100vh - 15.5em)"
              overflow="auto"
              wordWrap="normal"
              whiteSpace="pre"
              resize="vertical"
              fontFamily="monospace"
              p="1em"
              value={state.body}
              onChange={handleChange('body')} 
            />
          </TabPanel>
          <TabPanel>
            <Textarea 
              height="calc(100vh - 15.5em)"
              overflow="auto"
              wordWrap="normal"
              whiteSpace="pre"
              resize="vertical"
              fontFamily="monospace"
              p="1em"
              value={state.query}
              onChange={handleChange('query')} 
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Stack>
  )
}

export default Playground;