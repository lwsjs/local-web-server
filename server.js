#!/usr/bin/env node 
var connect = require('connect');

var port = process.argv[2] || 8000;
connect()
    .use(connect.logger('dev'))
    .use(connect.static(process.cwd()))
    .use(connect.directory(process.cwd()))
    .listen();
    
console.log("listening on port " + port);