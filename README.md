Fires up a simple, static web server on a given port. Use for local web development or file sharing (directory browsing enabled).

Install
-------
Install [Node.js](http://nodejs.org), then run

```sh
$ npm install -g local-web-server
```

*Linux/Mac users may need to run the above with `sudo`*

Usage
-----
From the folder you wish to serve, run:
```sh
$ ws [--port|-p <port>] [--log-format|-p dev|default|short|tiny]
```
The default port and log-format are 8000 and "dev", respectively. 

Use with Logstalgia
===================
The "default" log-format is compatible with [logstalgia](http://code.google.com/p/logstalgia/).

If you wrote your log output to disk, like so:
```sh
$ ws --log-format default > web.log
```

Then you could visualise in logstalgia with:
```sh
$ logstalgia web.log
```

Alternatively, pipe directly from ws into logstalgia for real-time visualisation:
```sh
$ ws --log-format default | logstalgia -
```

[![githalytics.com alpha](https://cruel-carlota.pagodabox.com/050b17b4263c08f12a2a9d9bbda80025 "githalytics.com")](http://githalytics.com/75lb/local-web-server)
