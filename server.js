var connect = require('connect');

var app = connect()
    .use(connect.logger('dev'))
    .use(connect.static(process.cwd()))
    .use(connect.directory(process.cwd()))
    .listen(8000);