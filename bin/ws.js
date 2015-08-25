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
var url = require("url");

/* specify the command line arg definitions and usage forms */
var cli = cliArgs(cliOptions);
var usage = cli.getUsage({
    title: "local-web-server",
    description: "Lightweight static web server, zero configuration.",
    footer: "Project home: [underline]{https://github.com/75lb/local-web-server}",
    usage: {
        forms: [ 
            "$ ws <server options>",  
            "$ ws --config",
            "$ ws --help"
        ]
    },
    groups: {
        server: "Server",
        misc: "Misc"
    }
});

/* parse command line args */
try {
    var wsOptions = cli.parse();
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
wsOptions.server = o.extend(builtInDefaults, storedConfig, wsOptions.server);

/* user input validation */
if (!t.isNumber(wsOptions.server.port)) {
    halt("please supply a numeric port value");
}

if (wsOptions.misc.config){
    dope.log("Stored config: ");
    dope.log(storedConfig);
    process.exit(0);

} else if (wsOptions.misc.help){
    dope.log(usage);

} else {
    process.on("SIGINT", function(){
        dope.showCursor();
        dope.log();
        process.exit(0);
    });
    
    dope.hideCursor();
    launchServer();

    /* write launch information to stderr (stdout is reserved for web log output) */
    if (path.resolve(wsOptions.server.directory) === process.cwd()){
        dope.error("serving at %underline{%s}", "http://localhost:" + wsOptions.server.port);
    } else {
        dope.error("serving %underline{%s} at %underline{%s}", wsOptions.server.directory, "http://localhost:" + wsOptions.server.port);
    }
}

function halt(message){
    dope.red.log("Error: %s",  message);
    dope.log(usage);
    process.exit(1);
}

function launchServer(){
    var app = connect();

    /* enable cross-origin requests on all resources */
    app.use(function(req, res, next){
        res.setHeader("Access-Control-Allow-Origin", "*");
        next();
    });

    if (wsOptions.server["log-format"] !== "none") app.use(getLogger());

    /* --compress enables compression */
    if (wsOptions.server.compress) app.use(compress());

    /* set the mime-type overrides specified in the config */
    serveStatic.mime.define(wsOptions.server.mime);

    /* enable static file server, including directory browsing support */
    app.use(serveStatic(path.resolve(wsOptions.server.directory)))
        .use(directory(path.resolve(wsOptions.server.directory), { icons: true }));
        
    /* launch server */
    http.createServer(app)
        .on("error", function(err){
            if (err.code === "EADDRINUSE"){
                halt("port " + wsOptions.server.port + " is already is use");
            } else {
                halt(err.message);
            }
        })
        .listen(wsOptions.server.port);
}

function getLogger(){
    /* log using --log-format (if supplied) */
    var logFormat = wsOptions.server["log-format"];
    if(logFormat) {
        if (logFormat === "logstalgia"){
            /* customised logger :date token, purely to satisfy Logstalgia. */
            morgan.token("date", function(){
                var d = new Date();
                return (d.getDate() + "/" + d.getUTCMonth() + "/" + d.getFullYear() + ":" + d.toTimeString())
                        .replace("GMT", "").replace(" (BST)", "");
            });
            logFormat = "combined";
        }

        return morgan(logFormat);

    /* if no `--log-format` was specified, pipe the default format output
    into `log-stats`, which prints statistics to the console */
    } else {
        return morgan("common", { stream: logStats({ refreshRate: wsOptions.server["refresh-rate"] }) });
    }
}
