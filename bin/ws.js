#!/usr/bin/env node
"use strict";
var dope = require("console-dope");
var http = require("http");
var cliArgs = require("command-line-args");
var o = require("object-tools");
var t = require("typical");
var path = require("path");
var loadConfig = require("config-master");
var homePath = require("home-path");
var logStats = require("stream-log-stats");
var connect = require("connect");
var morgan = require("morgan");
var serveStatic = require("serve-static");
var directory = require("serve-index");
var compress = require("compression");
var cliOptions = require("../lib/cli-options");

/* specify the command line arg definitions and usage forms */
var cli = cliArgs(cliOptions);
var usage = cli.getUsage({
    title: "local-web-server",
    header: "Lightweight static web server, zero configuration.",
    footer: "Project home: https://github.com/75lb/local-web-server",
    forms: [ 
        "$ ws <server options>",  
        "$ ws --config",
        "$ ws --help"
    ],
    groups: {
        server: "Server",
        misc: "Server"
    }
});

/* parse command line args */
try {
    var argv = cli.parse();
} catch(err){
    halt(err.message);
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

var builtInDefaults = {
    port: 8000,
    directory: process.cwd(),
    "refresh-rate": 500,
    mime: {}
};

/* override built-in defaults with stored config and then command line args */
argv.server = o.extend(builtInDefaults, storedConfig, argv.server);

/* user input validation */
var logFormat = argv.server["log-format"];
if (!t.isNumber(argv.server.port)) {
    halt("please supply a numeric port value");
}

if (argv.misc.config){
    dope.log("Stored config: ");
    dope.log(storedConfig);
    process.exit(0);

} else if (argv.misc.help){
    dope.log(usage);

} else {
    process.on("SIGINT", function(){
        dope.showCursor();
        dope.log();
        process.exit(0);
    });
    
    var app = connect();

    /* enable cross-origin requests on all resources */
    app.use(function(req, res, next){
        res.setHeader("Access-Control-Allow-Origin", "*");
        next();
    });

    /* log using --log-format (if supplied) */
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
                logFormat = "combined";
            }

            app.use(morgan(logFormat));
        }

    /* if no `--log-format` was specified, pipe the default format output
    into `log-stats`, which prints statistics to the console */
    } else {
        dope.hideCursor();
        app.use(morgan("common", { stream: logStats({ refreshRate: argv.server["refresh-rate"] }) }));
    }

    /* --compress enables compression */
    if (argv.server.compress) app.use(compress());

    /* set the mime-type overrides specified in the config */
    serveStatic.mime.define(argv.server.mime);

    /* enable static file server, including directory browsing support */
    app.use(serveStatic(path.resolve(argv.server.directory)))
        .use(directory(path.resolve(argv.server.directory), { icons: true }));

    /* launch server */
    http.createServer(app)
        .on("error", function(err){
            if (err.code === "EADDRINUSE"){
                halt("port " + argv.server.port + " is already is use");
            } else {
                halt(err.message);
            }
        })
        .listen(argv.server.port);

    /* write launch information to stderr (stdout is reserved for web log output) */
    if (path.resolve(argv.server.directory) === process.cwd()){
        dope.error("serving at %underline{%s}", "http://localhost:" + argv.server.port);
    } else {
        dope.error("serving %underline{%s} at %underline{%s}", argv.server.directory, "http://localhost:" + argv.server.port);
    }
}

function halt(message){
    dope.red.log("Error: %s",  message);
    dope.log(usage);
    process.exit(1);
}
