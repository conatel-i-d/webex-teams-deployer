import React from 'react';
import { 
  FormControl,
  FormLabel,
  Input,
  FormHelperText,
  Button,
  Box,
  Alert,
  AlertTitle,
  AlertIcon,
  AlertDescription
} from '@chakra-ui/core';
import { useDispatch } from 'react-redux';
import { setApiKey } from '../../state/app.js';

function ApiKeyForm() {
  var dispatch = useDispatch();
  var [apiKey, setApiKeyState] = React.useState('');
  
  var handleSubmit = React.useCallback((e) => {
    e.preventDefault();
    dispatch(setApiKey(apiKey));
  }, [dispatch, apiKey]);

  var handleChange = React.useCallback((e) => {
    setApiKeyState(e.target.value);
  }, [setApiKeyState]);

  return (
    <Box height="100vh" width="100%" bg="whitesmoke" p="1em">
      <Alert status="error" mb="1em">
        <AlertIcon />
        <AlertTitle mr={2}>Configuración de Webex API Key</AlertTitle>
        <AlertDescription>Es necesario configurar la Webex API Key antes de empezar.</AlertDescription>
      </Alert>

      <form onSubmit={ handleSubmit }>
        <FormControl>
          <FormLabel htmlFor="apiKey">Webex Teams API Key</FormLabel>
          <Input type="apiKey" id="apiKey" aria-describedby="apiKey-helper-text" onChange={handleChange} />
          <FormHelperText id="apiKey-helper-text">
            La API de Webex Teams se puede obtener en la página de <a href="https://developer.webex.com/docs/api/getting-started">Cisco Webex for Developers</a>.
          </FormHelperText>
        </FormControl>
        <Button type="submit" disabled={apiKey === ''}>Guardar ApiKey</Button>
      </form>
    </Box>
  )
}

export default ApiKeyForm;