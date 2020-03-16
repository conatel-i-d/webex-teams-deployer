import React from 'react';
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@chakra-ui/core';

import Project from './Project/'
import Playground from './Playground/';
import AppSettings from '../AppSettings/';

var TABS_SELECTED_STYLE = {
  color: 'white',
  bg: 'blue.500',
  outline: 'none',
  boxShadow: 'none',
  borderBottom: '2px solid #3182ce',
};

var TABS_ACTIVE_STYLE = {
  color: 'white',
  bg: 'blue.500',
  outline: 'none',
  boxShadow: 'none',
};

function Router() {
  return (
    <Tabs isFitted variant="unstyled" defaultIndex={1}>
      <TabList>
        <Tab border="1px solid white" borderBottom="2px solid whitesmoke" _selected={TABS_SELECTED_STYLE} _active={TABS_ACTIVE_STYLE}>Proyecto</Tab>
        <Tab border="1px solid white" borderBottom="2px solid whitesmoke" _selected={TABS_SELECTED_STYLE} _active={TABS_ACTIVE_STYLE}>Playground</Tab>
        <Tab border="1px solid white" borderBottom="2px solid whitesmoke" _selected={TABS_SELECTED_STYLE} _active={TABS_ACTIVE_STYLE}>Configuración</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <Project />
        </TabPanel>
        <TabPanel>
          <Playground />
        </TabPanel>
        <TabPanel>
          <AppSettings bg="white" alert={false} full={false} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}

export default Router;