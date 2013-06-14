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
$ ws [port]
```
The `port` arg is optional, the default is 8000.

Use with Logstalgia
===================
The `default` log format is compatible with [logstalgia](http://code.google.com/p/logstalgia/).

Write your log output to disk:
```sh
$ ws --logger default > web.log
```

Then visualise in logstalgia:
```sh
$ logstalgia web.log
```

Or pipe directly into logstalgia for real-time visualisation:
```sh
$ ws --logger default | logstalgia -
```

[![githalytics.com alpha](https://cruel-carlota.pagodabox.com/050b17b4263c08f12a2a9d9bbda80025 "githalytics.com")](http://githalytics.com/75lb/local-web-server)
