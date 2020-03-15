var { default: installExtension, REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS, REACT_PERF } = require('electron-devtools-installer');

Promise.all([
  installExtension(REACT_DEVELOPER_TOOLS),
  installExtension(REDUX_DEVTOOLS),
  installExtension(REACT_PERF),
])
  .then((extensions) => {
    console.log(extensions);
    for (let extension of extensions) {
      console.log(`Installed extension: ${ extension }`);
    }
  })
  .catch(err => console.error(err));