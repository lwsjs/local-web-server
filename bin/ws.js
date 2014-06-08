#!/usr/bin/env node
"use strict";
var dope = require("console-dope"),
    connect = require("connect"),
    http = require("http"),
    cliArgs = require("command-line-args"),
    o = require("object-ting"),
    s = require("string-ting"),
    path = require("path"),
    loadConfig = require("config-master"),
    morgan = require("morgan"),
    serveStatic = require("serve-static"),
    directory = require("serve-index"),
    compress = require("compression"),
    homePath = require("home-path"),
    byteSize = require("byte-size");

var usage =
"usage: \n\
$ ws [--directory|-d <dir>] [--port|-p <port>] [--log-format|-f dev|default|short|tiny] [--compress|-c]\n\
$ ws --config\n\
$ ws --help|-h";

function halt(message){
    dope.red.log("Error: %s",  message);
    dope.log(usage);
    process.exit(1);
}

/* Merge together options from 
- ~/.local-web-server.json
- {cwd}/.local-web-server.json
- {cwd}/package.json 
*/
var storedConfig = loadConfig(
    path.join(homePath(), ".local-web-server.json"),
    path.join(process.cwd(), ".local-web-server.json"),
    path.join(process.cwd(), "package.json:local-web-server")
);

/* override stored config with values parsed from command line */
try {
    var argv = cliArgs([
        { name: "port", alias: "p", type: Number, defaultOption: true, value: 8000 },
        { name: "log-format", alias: "f", type: String },
        { name: "help", alias: "h", type: Boolean },
        { name: "directory", alias: "d", type: String, value: process.cwd() },
        { name: "config", type: Boolean },
        { name: "compress", alias: "c", type: Boolean }
    ]).parse();
} catch(err){
    halt(err.message);
}
argv = o.extend(storedConfig, argv);

if (argv.config){
    dope.log("Stored config: ");
    dope.log(storedConfig);
    process.exit(0);

} else if (argv.help){
    dope.log(usage);

} else {
    var total = {
        req: 0,
        bytes: 0,
        connections: 0
    };

    process.on("SIGINT", function(){
        dope.showCursor();
        dope.log();
        process.exit(0);
    });

    /* customised logger :date token, purely to satisfy Logstalgia. */
    morgan.token("date", function(){
        var a = new Date();
        return (a.getDate() + "/" + a.getUTCMonth() + "/" + a.getFullYear() + ":" + a.toTimeString())
                .replace("GMT", "").replace(" (BST)", "");
    });

    var app = connect();

    /* log using --log-format (if supplied), else output statics */
    if(argv["log-format"]){
        app.use(morgan(argv["log-format"]));
    } else {
        app.use(function(req, res, next){
            dope.column(1).write(++total.req);
            next();
        });
    }

    /* --compress enables compression */
    if (argv.compress) app.use(compress());

    /* static file server including directory browsing support */
    app.use(serveStatic(path.resolve(argv.directory)))
        .use(directory(path.resolve(argv.directory), { icons: true }));

    /* launch server */
    var server = http.createServer(app)
        .on("error", function(err){
            if (err.code === "EADDRINUSE"){
                halt("port " + argv.port + " is already is use");
            } else {
                halt(err.message);
            }
        })
        .listen(argv.port);

    /* write status to stderr so stdout can be piped to disk ($ ws > log.txt) */
    if (path.resolve(argv.directory) === process.cwd()){
        dope.error("serving at %underline{%s}", "http://localhost:" + argv.port);
    } else {
        dope.error("serving %underline{%s} at %underline{%s}", argv.directory, "http://localhost:" + argv.port);
    }

    /* in stats mode, monitor connections and bytes transferred */
    if (!argv["log-format"]){
        dope.hideCursor();
        dope.log("%underline{Requests}   %underline{Data}        %underline{Connections}");
        server.on("connection", function(socket){
            var oldWrite = socket.write;
            socket.write = function(data) {
                if (!Buffer.isBuffer(data)) {
                    data = new Buffer(data);
                }
                oldWrite.call(this, data);
                total.bytes += data.length;
                dope.column(12).write(s.padRight(byteSize(total.bytes, 2), 12));
            };
            dope.column(24).write(++total.connections);
            socket.on("close", function(){
                dope.column(24).write(s.padRight(--total.connections));
            });
        });
    }
}
