#!/usr/bin/env node 
var connect = require("connect"),
    http = require("http"),
    Thing = require("nature").Thing;

function red(txt){ return "\x1b[31m" + txt + "\x1b[0m"; }
function green(txt){ return "\x1b[32m" + txt + "\x1b[0m"; }
function halt(message){
    console.log(red("Error ") + message);
    console.log(usage);
    process.exit(1);
}

var usage = "usage: ws [--port|-p <port>] [--log-format|-f dev|default|short|tiny]";
var options = new Thing()
    .define({ name: "port", alias: "p", type: "number", defaultOption: true, default: 8000 })
    .define({ name: "log-format", alias: "f", type: "string", default: "dev" })
    .define({ name: "help", alias: "h", type: "boolean" })
    .on("error", function(err){
        halt(err.message);
    })
    .set(process.argv);

if (!options.valid){
    halt(options.validationMessages)

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

    var app = connect()
        .use(connect.logger(options["log-format"]))
        .use(connect.compress())
        .use(connect.static(process.cwd()))
        .use(connect.directory(process.cwd(), { icons: true }));
        
    http.createServer(app)
        .on("error", function(err){
            if (err.code === "EADDRINUSE"){
                halt("port " + options.port + " is already is use")
            } else {
                halt(err.message);
            }
        })
        .listen(options.port);

    process.stderr.write("serving at http://localhost:" + options.port + "\n");
}
