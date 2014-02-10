#!/usr/bin/env node
var connect = require("connect"),
    http = require("http"),
    util = require("util"),
    Thing = require("nature").Thing,
    wodge = require("wodge");

var usage = "usage: ws [--directory|-d <directory>] [--port|-p <port>] [--log-format|-f dev|default|short|tiny]";

var options = new Thing()
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
        halt("port " + options.port + " is already is use");
    } else {
        halt(err.message);
    }
}

function halt(message){
    console.log(wodge.red("Error ") + message);
    console.log(usage);
    process.exit(1);
}

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

    var app = connect();
        
    if(options.stats){
        var reqCount = 0;
        app.use(function(req, res, next){
            if (reqCount === 0){
                process.stdout.write("Files served: ");
            }
            process.stdout.write(reqCount.toString());
            reqCount++;
            process.stdout.write("\x1b[15G");
            next();
        });
    } else {
        app.use(connect.logger(options["log-format"]));
    }
    
    app.use(connect.compress())
        .use(connect.static(options.directory))
        .use(connect.directory(options.directory, { icons: true }));
    
    http.createServer(app)
        .on("error", handleServerError)
        .listen(options.port);

    /*
    write to stderr so stdout can be piped to disk ($ ws > log.txt)
    */
    console.error(util.format(
        "serving %sat %s",
        options.directory === process.cwd() ? "" : wodge.underline(options.directory) + " ",
        wodge.underline("http://localhost:" + options.port)
    ));
}
