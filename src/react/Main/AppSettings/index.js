import React from 'react';
import { 
  FormControl,
  FormLabel,
  Input,
  FormHelperText,
  Button,
  Flex,
  Box,
  Alert,
  AlertTitle,
  AlertIcon,
  AlertDescription
} from '@chakra-ui/core';
import { FaFolderOpen } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { setApiKey, setFolder } from '../../state/app.js';

var { dialog } = window;


function AppSettings() {
  var dispatch = useDispatch();
  var [apiKey, setApiKeyState] = React.useState('');
  var [folder, setFolderState] = React.useState('');
  
  var handleSubmit = React.useCallback((e) => {
    e.preventDefault();
    dispatch(setApiKey(apiKey));
    dispatch(setFolder(folder));
  }, [dispatch, apiKey, folder]);

  var handleApiKeyChange = React.useCallback((e) => {
    setApiKeyState(e.target.value);
  }, [setApiKeyState]);

  var handleFolderChange = React.useCallback(() => {
    var selectedFolders = dialog.showOpenDialogSync({
      title: 'Seleccionar carpeta con archivos CSV',
      buttonLabel: 'Seleccionar carpeta',
      properties: ['openDirectory', 'createDirectory']
    });
    if (selectedFolders.length === 0) return;
    var selectedFolder = selectedFolders[0];
    console.log(selectedFolder);
    setFolderState(selectedFolder);
  }, [setFolderState]);

  return (
    <Box height="100vh" width="100%" bg="whitesmoke" p="1em">
      <Alert status="error" mb="1em" varian="subtle" flexDirection="column" justifyContent="center">
        <AlertIcon size="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">Configuración de Webex API Key y Carpeta del proyecto</AlertTitle>
        <AlertDescription>Esta configuración es necesaria antes de comenzar.</AlertDescription>
      </Alert>

      <form onSubmit={ handleSubmit }>
        <FormControl>
          <FormLabel htmlFor="apiKey">Webex Teams API Key</FormLabel>
          <Input type="apiKey" value={apiKey} id="apiKey" aria-describedby="apiKey-helper-text" onChange={handleApiKeyChange} />
          <FormHelperText id="apiKey-helper-text">
            La API de Webex Teams se puede obtener en la página de <a href="https://developer.webex.com/docs/api/getting-started">Cisco Webex for Developers</a>.
          </FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="folder">Carpeta del proyecto</FormLabel>
          <Flex>
            <Input readOnly roundedRight="0" type="folder" value={folder} id="folder" aria-describedby="folder-helper-text" />
            <Button width="300px" variant="solid" roundedLeft="0" onClick={handleFolderChange}>
              <Box as={FaFolderOpen} mr="0.5em" />
              Seleccionar Carpeta
            </Button>
          </Flex>
          <FormHelperText id="folder-helper-text">
            Carpeta donde se encuentran los archivos CSV correspondiente a los cursos.
          </FormHelperText>
        </FormControl>
        <Button type="submit" disabled={apiKey === '' || folder === ''}>Guardar Configuración</Button>
      </form>
    </Box>
  )
}

export default AppSettings;