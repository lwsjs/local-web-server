#!/usr/bin/env node
var connect = require("connect"),
    http = require("http"),
    Thing = require("nature").Thing,
    wodge = require("wodge");

var usage = "usage: ws [--directory|-d <directory>] [--port|-p <port>] [--log-format|-f dev|default|short|tiny]";

function halt(message){
    console.log(wodge.red("Error ") + message);
    console.log(usage);
    process.exit(1);


var options = new Thing()
    .define({ name: "port", alias: "p", type: "number", defaultOption: true, value: 8000 })
    .define({ name: "log-format", alias: "f", type: "string", value: "dev" })
    .define({ name: "help", alias: "h", type: "boolean" })
    .define({ name: "directory", alias: "d", type: "string", value: process.cwd() })
    .on("error", function(err){
        halt(err.message);
    })
    .set(process.argv);

if (!options.valid){
    halt(options.validationMessages);

} else if (options.help){
    console.log(usage);

} else {
    /**
    customised connect.logger :date token, purely to satisfy Logstalgia.
    */
    connect.logger.token("date", function(){
        var a = new Date();
        return (a.getDate() + "/" + a.getUTCMonth() + "/" + a.getFullYear() + ":" + a.toTimeString())
                .replace("GMT", "").replace(" (BST)", "");
    });

    var app = connect()
        .use(connect.logger(options["log-format"]))
        .use(connect.compress())
        .use(connect.static(options.directory))
        .use(connect.directory(options.directory, { icons: true }));

    http.createServer(app)
        .on("error", function(err){
            if (err.code === "EADDRINUSE"){
                halt("port " + options.port + " is already is use");
            } else {
                halt(err.message);
            }
        })
        .listen(options.port);

    process.stderr.write("serving at http://localhost:" + options.port + "\n");
}
