import React from 'react';
import { Flex, Spinner } from '@chakra-ui/core';
import { useDispatch, useSelector } from 'react-redux';

import { init, readySelector, apiKeySelector, folderSelector } from '../state/app.js';
import AppSettings from './AppSettings/';

function Main() {
  var dispatch = useDispatch();
  var ready = useSelector(readySelector);
  var apiKey = useSelector(apiKeySelector);
  var folder = useSelector(folderSelector);

  React.useEffect(() => {
    dispatch(init());
  }, [dispatch]);

  if (ready === false) return <Flex minH="100vh" align="center" justify="center"><Spinner /></Flex>

  if (apiKey === undefined || folder === undefined) return <AppSettings />

  return (
    <Flex className="Main"></Flex>
  );
}

export default Main;