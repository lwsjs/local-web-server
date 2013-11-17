#!/usr/bin/env node 
var connect = require('connect'),
    Thing = require("nature").Thing;

var usage = "usage: ws [--port|-p <port>] [--log-format|-p dev|default|short|tiny]";
var options = new Thing()
    .define({ name: "port", alias: "p", type: "number", defaultOption: true, default: 8000 })
    .define({ name: "log-format", alias: "f", type: "string", default: "dev" })
    .define({ name: "help", alias: "h", type: "boolean" })
    .set(process.argv);

if (!options.valid){
    console.log(usage);
    throw new Error(options.validationMessages);

} else if (options.help){
    console.log(usage);

} else {
    /**
    customised connect.logger :date token, purely to satisfy Logstalgia. 
    */
    connect.logger.token('date', function(req, res){ 
        var a = new Date();
        return (a.getDate() + "/" + a.getUTCMonth() + "/" + a.getFullYear() + ":" + a.toTimeString())
                .replace("GMT", "").replace(" (BST)", "");
    });

    connect()
        .use(connect.logger(options["log-format"]))
        .use(connect.static(process.cwd()))
        .use(connect.directory(process.cwd()))
        .listen(options.port);

    process.stderr.write("serving at http://localhost:" + options.port + "\n");
}
