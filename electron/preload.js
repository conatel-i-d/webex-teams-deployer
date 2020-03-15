var { ipcRenderer, remote: { dialog } } = require('electron');


window.ipcRenderer = ipcRenderer;
window.dialog = dialog;