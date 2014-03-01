#!/usr/bin/env node
"use strict";
require("console-dope");
var connect = require("connect"),
    http = require("http"),
    util = require("util"),
    fs = require("fs"),
    Thing = require("nature").Thing,
    w = require("wodge"),
    path = require("path");

var usage = "usage: ws [--directory|-d <directory>] [--port|-p <port>] [--log-format|-f dev|default|short|tiny]";

function halt(message){
    console.red.log("Error: %s",  message);
    console.log(usage);
    process.exit(1);
}

function handleServerError(err){
    if (err.code === "EADDRINUSE"){
        halt("port " + argv.port + " is already is use");
    } else {
        halt(err.message);
    }
}

/**
parse command-line args
*/
var argv = new Thing()
    .define({ name: "port", alias: "p", type: "number", defaultOption: true, value: 8000 })
    .define({ name: "log-format", alias: "f", type: "string" })
    .define({ name: "help", alias: "h", type: "boolean" })
    .define({ name: "directory", alias: "d", type: "string", value: process.cwd() })
    .define({ name: "compress", alias: "c", type: "boolean" })
    .on("error", function(err){
        halt(err.message);
    });
    
/*
Set default options from "package.json", ".local-web-server.json" or "~/.local-web-server.json", in that order
*/
var pkgPath = path.join(process.cwd(), "package.json"),
    lwsPath = path.join(process.cwd(), ".local-web-server.json"),
    homePath = path.join(w.getHomeDir(), ".local-web-server.json");
if (fs.existsSync(pkgPath)){
    argv.set(require(pkgPath)["local-web-server"]);
}
if (fs.existsSync(lwsPath)){
    argv.set(require(lwsPath));
}
if (fs.existsSync(homePath)){
    argv.set(require(homePath));
}

/*
Finally, set the options from the command-line, overriding all defaults. 
*/
argv.set(process.argv);
    
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
    var total = {
        req: 0,
        bytes: 0,
        connections: 0
    };

    process.on("SIGINT", function(){
        console.showCursor();
        console.log();
        process.exit(0);
    });

    /**
    customised connect.logger :date token, purely to satisfy Logstalgia.
    */
    connect.logger.token("date", function(){
        var a = new Date();
        return (a.getDate() + "/" + a.getUTCMonth() + "/" + a.getFullYear() + ":" + a.toTimeString())
                .replace("GMT", "").replace(" (BST)", "");
    });

    var app = connect();

    /*
    log using --log-format (if supplied), else output statics
    */
    if(argv["log-format"]){
        app.use(connect.logger(argv["log-format"]));
    } else {
        app.use(function(req, res, next){
            console.column(1).write(++total.req);
            next();
        });
    }

    /**
    --compress enables compression
    */
    if (argv.compress) app.use(connect.compress());

    /**
    static file server including directory browsing support
    */
    app.use(connect.static(argv.directory))
        .use(connect.directory(argv.directory, { icons: true }));

    /**
    launch server
    */
    var server = http.createServer(app)
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

    /**
    in stats mode, monitor connections and bytes transferred
    */
    if (!argv["log-format"]){
        console.hideCursor();
        console.log("%u{Requests}   %u{Data}        %u{Connections}");
        server.on("connection", function(socket){
            var oldWrite = socket.write;
            socket.write = function(data) {
                if (!Buffer.isBuffer(data)) {
                    data = new Buffer(data);
                }
                oldWrite.call(this, data);
                total.bytes += data.length;
                console.column(12).write(w.padRight(w.bytesToSize(total.bytes, 2), 12));
            };
            console.column(24).write(++total.connections);
            socket.on("close", function(){
                console.column(24).write(w.padRight(--total.connections));
            });
        });
    }
}
