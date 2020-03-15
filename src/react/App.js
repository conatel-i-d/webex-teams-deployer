import React from 'react';

import logo from './logo.svg';
import './App.css';
import { channels } from '../shared/constants.js';

var { ipcRenderer } = window;

function App() {
  var [state, setState] = React.useState({ appName: '', appVersion: ''});

  React.useEffect(() => {
    ipcRenderer.send(channels.APP_INFO);
    ipcRenderer.on(channels.APP_INFO, (event, arg) => {
      ipcRenderer.removeAllListeners(channels.APP_INFO);
      var { appName, appVersion } = arg;
      setState({ appName, appVersion });
    });
  }, [setState]);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <p>{state.appName} version {state.appVersion}</p>
      </header>
    </div>
  );
}

export default App;
