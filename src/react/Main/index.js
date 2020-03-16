import React from 'react';
import { Flex, Spinner } from '@chakra-ui/core';
import { useDispatch, useSelector } from 'react-redux';

import { init, readySelector } from '../state/app.js';
import Router from './Router/';

function Main() {
  var dispatch = useDispatch();
  var ready = useSelector(readySelector);

  React.useEffect(() => {
    dispatch(init());
  }, [dispatch]);

  if (ready === false) return <Flex minH="100vh" align="center" justify="center"><Spinner /></Flex>;

  return <Router />;
}

export default Main;