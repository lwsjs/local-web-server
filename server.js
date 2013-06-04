#!/usr/bin/env node 
var connect = require('connect');

var app = connect()
    .use(connect.logger('dev'))
    .use(connect.static(process.cwd()))
    .use(connect.directory(process.cwd()))
    .listen(process.argv[2] || 8000);