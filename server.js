#!/usr/bin/env node 
var connect = require('connect');

/**
usage:
$ ws <port> <connect-logger-profile>
*/

var port = process.argv[2] || 8000,
    loggerProfile = process.argv[3] || "dev";

connect.logger.token('date', function(req, res){ 
    var a = new Date();
    return (a.getDate() + "/" + a.getUTCMonth() + "/" + a.getFullYear() + ":" + a.toTimeString())
            .replace("GMT", "").replace(" (BST)", "");
});
    
connect()
    .use(connect.logger(loggerProfile))
    .use(connect.static(process.cwd()))
    .use(connect.directory(process.cwd()))
    .listen(port);
    
process.stderr.write("listening on port " + port + "\n");