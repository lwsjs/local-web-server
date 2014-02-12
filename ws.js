#!/usr/bin/env node
"use strict";
require("more-console");    
var connect = require("connect"),
    http = require("http"),
    util = require("util"),
    Thing = require("nature").Thing;

var usage = "usage: ws [--directory|-d <directory>] [--port|-p <port>] [--log-format|-f dev|default|short|tiny]";

function halt(message){
    console.red.log("Error: %s",  message);
    console.log(usage);
    process.exit(1);
}

/**
parse command-line args
*/
var argv = new Thing()
    .define({ name: "port", alias: "p", type: "number", defaultOption: true, value: 8000 })
    .define({ name: "log-format", alias: "f", type: "string", value: "dev" })
    .define({ name: "help", alias: "h", type: "boolean" })
    .define({ name: "directory", alias: "d", type: "string", value: process.cwd() })
    .define({ name: "stats", alias: "s", type: "boolean" })
    .on("error", function(err){
        halt(err.message);
    })
    .set(process.argv);

function handleServerError(err){
    if (err.code === "EADDRINUSE"){
        halt("port " + argv.port + " is already is use");
    } else {
        halt(err.message);
    }
}

/**
Die here if invalid args received
*/
if (!argv.valid) halt(argv.validationMessages);


/**
$ ws --help
*/
if (argv.help){
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

    var app = connect();
        
    if(argv.stats){
        var reqCount = 0;
        app.use(function(req, res, next){
            if (reqCount === 0){
                console.write("Files served: ");
            }
            console.column(15).write(reqCount++);
            next();
        });
    } else {
        app.use(connect.logger(argv["log-format"]));
    }
    
    app.use(connect.compress())
        .use(connect.static(argv.directory))
        .use(connect.directory(argv.directory, { icons: true }));
    
    http.createServer(app)
        .on("error", handleServerError)
        .listen(argv.port);

    /*
    write status to stderr so stdout can be piped to disk ($ ws > log.txt)
    */
    if (argv.directory === process.cwd()){
        console.error("serving at %u{%s}", "http://localhost:" + argv.port);
    } else {
        console.error("serving %u{%s} at %u{%s}", argv.directory, "http://localhost:" + argv.port);
    }
}
