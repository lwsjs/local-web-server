#!/usr/bin/env node
"use strict";
var dope = require("console-dope"),
    http = require("http"),
    cliArgs = require("command-line-args"),
    o = require("object-tools"),
    path = require("path"),
    loadConfig = require("config-master"),
    homePath = require("home-path"),
    logStats = require("stream-log-stats"),
    connect = require("connect"),
    morgan = require("morgan"),
    serveStatic = require("serve-static"),
    directory = require("serve-index"),
    compress = require("compression");

var usage =
"usage: \n\
$ ws [--directory|-d <dir>] [--port|-p <port>] [--log-format|-f node|dev|default|short|tiny|logstalgia] [--compress|-c]\n\
$ ws --config\n\
$ ws --help|-h";

function halt(message){
    dope.red.log("Error: %s",  message);
    dope.log(usage);
    process.exit(1);
}

/* Load and merge together options from
- ~/.local-web-server.json
- {cwd}/.local-web-server.json
- the `local-web-server` property of {cwd}/package.json
*/
var storedConfig = loadConfig(
    path.join(homePath(), ".local-web-server.json"),
    path.join(process.cwd(), ".local-web-server.json"),
    { jsonPath: path.join(process.cwd(), "package.json"), configProperty: "local-web-server" }
);

/* parse command line args */
try {
    var argv = cliArgs([
        { name: "port", alias: "p", type: Number, defaultOption: true },
        { name: "log-format", alias: "f", type: String },
        { name: "help", alias: "h", type: Boolean },
        { name: "directory", alias: "d", type: String },
        { name: "config", type: Boolean },
        { name: "compress", alias: "c", type: Boolean },
        { name: "refreshRate", alias: "r", type: Number }
    ]).parse();
} catch(err){
    halt(err.message);
}

var builtInDefaults = {
    port: 8000,
    directory: process.cwd(),
    refreshRate: 500
};

/* override built-in defaults with stored config and then command line args */
argv = o.extend(builtInDefaults, storedConfig, argv);

if (argv.config){
    dope.log("Stored config: ");
    dope.log(storedConfig);
    process.exit(0);

} else if (argv.help){
    dope.log(usage);

} else {
    process.on("SIGINT", function(){
        dope.showCursor();
        dope.log();
        process.exit(0);
    });

    var app = connect();

    /* log using --log-format (if supplied) */
    var logFormat = argv["log-format"];
    if(logFormat) {
        if (logFormat === "none"){
            // do nothing, no logging required
        } else {
            if (logFormat === "logstalgia"){
                /* customised logger :date token, purely to satisfy Logstalgia. */
                morgan.token("date", function(){
                    var a = new Date();
                    return (a.getDate() + "/" + a.getUTCMonth() + "/" + a.getFullYear() + ":" + a.toTimeString())
                            .replace("GMT", "").replace(" (BST)", "");
                });
                logFormat = "default";
            }

            app.use(morgan(logFormat));
        }        

    /* if no `--log-format` was specified, pipe the default format output
    into `log-stats`, which prints statistics to the console */
    } else {
        app.use(morgan({ stream: logStats({ refreshRate: argv.refreshRate }) }));
    }

    /* --compress enables compression */
    if (argv.compress) app.use(compress());

    /* static file server including directory browsing support */
    app.use(serveStatic(path.resolve(argv.directory)))
        .use(directory(path.resolve(argv.directory), { icons: true }));

    /* launch server */
    http.createServer(app)
        .on("error", function(err){
            if (err.code === "EADDRINUSE"){
                halt("port " + argv.port + " is already is use");
            } else {
                halt(err.message);
            }
        })
        .listen(argv.port);

    /* write launch information to stderr (stdout is reserved for web log output) */
    if (path.resolve(argv.directory) === process.cwd()){
        dope.error("serving at %underline{%s}", "http://localhost:" + argv.port);
    } else {
        dope.error("serving %underline{%s} at %underline{%s}", argv.directory, "http://localhost:" + argv.port);
    }
}
