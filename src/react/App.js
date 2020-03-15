import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@chakra-ui/core';

import store from './state/store.js';
import Main from './Main/'

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Main />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
