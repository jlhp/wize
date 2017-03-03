'use strict';

const app = require('./app');
const port = app.get('port');
const server = app.listen(port);
const reload = require('reload');

server.on('listening', () =>
  console.log(`Feathers application started on ${app.get('host')}:${port}`)
);

reload(server, app);