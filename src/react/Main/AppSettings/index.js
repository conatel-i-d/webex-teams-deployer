import React from 'react';
import { 
  FormControl,
  FormLabel,
  Input,
  FormHelperText,
  Button,
  Flex,
  Box,
  useToast,
} from '@chakra-ui/core';
import { FaFileAlt } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { setApp, settingsSelector } from '../../state/app.js';

var { dialog } = window;


function AppSettings({bg="whitesmoke", full=true}) {
  var dispatch = useDispatch();
  var toast = useToast();
  var [settings, setSettings] = React.useState(useSelector(settingsSelector));
  
  var handleSubmit = React.useCallback((e) => {
    e.preventDefault();
    dispatch(setApp(settings));
    toast({
      title: "Configuración guardada.",
      description: "Datos guardados con exito.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  }, [dispatch, settings, toast]);

  var handleApiKeyChange = React.useCallback((e) => {
    setSettings({ ...settings, apiKey: e.target.value });
  }, [settings, setSettings]);

  var handleFileChange = React.useCallback((key) => () => {
    var selectedFiles = dialog.showOpenDialogSync({
      title: 'Seleccionar archivo CSV',
      buttonLabel: 'Seleccionar archivo',
      properties: ['openFile']
    });
    if (selectedFiles === undefined || selectedFiles.length === 0) return;
    var selectedFile = selectedFiles[0];
    setSettings({ ...settings, [key]: selectedFile });
  }, [setSettings, settings]);

  return (
    <Box height={full ? "100vh" : "100%"} width="100%" bg={bg} p="1em">
      <form onSubmit={ handleSubmit }>
        <FormControl>
          <FormLabel htmlFor="apiKey">Webex Teams API Key</FormLabel>
          <Input type="apiKey" value={settings.apiKey} id="apiKey" aria-describedby="apiKey-helper-text" onChange={handleApiKeyChange} />
          <FormHelperText id="apiKey-helper-text">
            La API de Webex Teams se puede obtener en la página de <a href="https://developer.webex.com/docs/api/getting-started">Cisco Webex for Developers</a>.
          </FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="coursesFileName">Nombre de archivo de cursos</FormLabel>
          <Flex>
            <Input readOnly roundedRight="0" type="coursesFileName" value={settings.coursesFileName} id="coursesFileName" aria-describedby="coursesFileName-helper-text" />
            <Button width="300px" variant="solid" roundedLeft="0" onClick={handleFileChange('coursesFileName')}>
              <Box as={FaFileAlt} mr="0.5em" />
              Seleccionar Archivo
            </Button>
          </Flex>
          <FormHelperText id="coursesFileName-helper-text">
            Archivo donde se encuentra la lista de cursos
          </FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="professorsFileName">Nombre de archivo de docentes por curso</FormLabel>
          <Flex>
            <Input readOnly roundedRight="0" type="professorsFileName" value={settings.professorsFileName} id="professorsFileName" aria-describedby="professorsFileName-helper-text" />
            <Button width="300px" variant="solid" roundedLeft="0" onClick={handleFileChange('professorsFileName')}>
              <Box as={FaFileAlt} mr="0.5em" />
              Seleccionar Archivo
            </Button>
          </Flex>
          <FormHelperText id="professorsFileName-helper-text">
            Archivo donde se encuentra la lista de docentes por curso
          </FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="studentsFileName">Nombre de archivo de estudiantes por curso</FormLabel>
          <Flex>
            <Input readOnly roundedRight="0" type="studentsFileName" value={settings.studentsFileName} id="studentsFileName" aria-describedby="studentsFileName-helper-text" />
            <Button width="300px" variant="solid" roundedLeft="0" onClick={handleFileChange('studentsFileName')}>
              <Box as={FaFileAlt} mr="0.5em" />
              Seleccionar Archivo
            </Button>
          </Flex>
          <FormHelperText id="studentsFileName-helper-text">
            Archivo donde se encuentra la lista de estudiantes por curso
          </FormHelperText>
        </FormControl>
        <Button type="submit">Guardar Configuración</Button>
      </form>
    </Box>
  )
}

export default AppSettings;