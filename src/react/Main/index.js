import React from 'react';
import { Flex, Spinner } from '@chakra-ui/core';
import { useDispatch, useSelector } from 'react-redux';

import { init, readySelector, apiKeySelector } from '../state/app.js';
import ApiKeyForm from './ApiKeyForm/';

function Main() {
  var dispatch = useDispatch();
  var ready = useSelector(readySelector);
  var apiKey = useSelector(apiKeySelector);

  React.useEffect(() => {
    dispatch(init());
  }, [dispatch]);

  if (ready === false) return <Flex minH="100vh" align="center" justify="center"><Spinner /></Flex>

  if (apiKey === undefined) return (
    <Flex><ApiKeyForm /></Flex>
  )

  return (
    <Flex className="Main"></Flex>
  );
}

export default Main;