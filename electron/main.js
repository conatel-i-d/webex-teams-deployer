var path = require('path');
var url = require('url');

var { app, BrowserWindow, ipcMain } = require('electron');
var { channels } = require('../src/shared/constants.js');

var IN_DEVELOPMENT = process.env.NODE_ENV !== 'production';
var mainWindow;

function createWindow() {
  var startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../index.html'),
    protocol: 'file:',
    slashes: true,
  });

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false,
  });

  if (IN_DEVELOPMENT === true) {
    mainWindow.webContents.openDevTools({
      mode: 'detach'
    });
  }

  mainWindow.loadURL(startUrl);
  mainWindow.on('closed', () => mainWindow = null);
  mainWindow.on('ready-to-show', () => mainWindow.show());

  if (IN_DEVELOPMENT === true) require('./chromeExtensions.js');
}

app.on('ready', createWindow);
app.on('window-all-closed', () => process.platform !== 'darwin' && app.quit());
app.on('activate', () => mainWindow === null && createWindow());

ipcMain.on(channels.APP_INFO, (event) => {
  event.sender.send(channels.APP_INFO, {
    appName: app.getName(),
    appVersion: app.getVersion(),
  });
});