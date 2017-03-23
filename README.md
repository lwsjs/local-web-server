[![view on npm](http://img.shields.io/npm/v/local-web-server.svg)](https://www.npmjs.org/package/local-web-server)
[![npm module downloads](http://img.shields.io/npm/dt/local-web-server.svg)](https://www.npmjs.org/package/local-web-server)
[![Build Status](https://travis-ci.org/lwsjs/local-web-server.svg?branch=master)](https://travis-ci.org/lwsjs/local-web-server)
[![Dependency Status](https://david-dm.org/lwsjs/local-web-server.svg)](https://david-dm.org/lwsjs/local-web-server)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/feross/standard)
[![Join the chat at https://gitter.im/lwsjs/local-web-server](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/lwsjs/local-web-server?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

***Requires node v7.6 or higher. Install the [previous release](https://github.com/lwsjs/local-web-server/tree/v1.x) for older node support. Documentation still WIP.***

# local-web-server

A convenient local web server to support productive, full-stack Javascript development. Built on [lws](https://github.com/lwsjs/lws).

**Features**

- Lightweight
- http/https ([http2](https://github.com/nodejs/http2) will be added once ready)
- Rewrite routes to local or remote resources
  - Url rewriting
  - Proxy certain routes to a remote server (e.g. an existing API). Avoids CORS pain when consuming remote services.
- Configurable by command-line options, stored config or both
- Efficient, predictable, entity-tag-powered conditional request handling (no need to 'Disable Cache' in DevTools, slowing page-load down)
- Configurable log output, compatible with [Goaccess, Logstalgia and glTail](https://github.com/lwsjs/local-web-server/blob/master/doc/visualisation.md)
- Configurable CORS rules. All origins allowed by default.

**Use cases**

Things you can build:

- Simple static website
- Single Page Application
  - Works well with React, Angular or vanilla JS.
- Real or mock web services
  - e.g. a RESTful API or microservice
  - Mocks are defined with config (static), or code (dynamic).
- Websocket server

## Synopsis

local-web-server is a command-line tool. To serve the current directory, run `ws`.

<pre><code>$ ws --help

<strong>local-web-server</strong>

  A convenient local web server to support productive, full-stack Javascript
  development.

<strong>Synopsis</strong>

  $ ws [--verbose] [--config-file file] [<server options>] [<middleware options>]
  $ ws --config
  $ ws --help
  $ ws --version

<strong>General</strong>

  -h, --help               Print these usage instructions.
  --config                 Print the active config.
  -c, --config-file file   Config filename to use, defaults to "lws.config.js".
  -v, --verbose            Verbose output.
  --version                Print the version number.

<strong>Server</strong>

  -p, --port number     Web server port.
  --hostname string     The hostname (or IP address) to listen on. Defaults to 0.0.0.0.
  --stack feature ...   Feature stack.
  --key file            SSL key. Supply along with --cert to launch a https server.
  --cert file           SSL cert. Supply along with --key to launch a https server.
  --https               Enable HTTPS using a built-in key and cert, registered to the domain
                        127.0.0.1.

<strong>Middleware</strong>

  -f, --log.format string        If a format is supplied an access log is written to stdout. If not, a dynamic
                                 statistics view is displayed. Use a preset ('none', 'dev','combined',
                                 'short', 'tiny', 'stats', or 'logstalgia') or supply a custom format (e.g.
                                 ':method -> :url').
  --cors.origin                  Access-Control-Allow-Origin value. Default is request Origin header.
  --cors.allow-methods           Access-Control-Allow-Methods value. Default is
                                 "GET,HEAD,PUT,POST,DELETE,PATCH"
  -r, --rewrite expression ...   A list of URL rewrite rules. For each rule, separate the 'from' and 'to'
                                 routes with '->'. Whitespace surrounded the routes is ignored. E.g. '/from ->
                                 /to'.
  -b, --forbid path ...          A list of forbidden routes.
  -n, --no-cache                 Disable etag-based caching - forces loading from disk each request.
  -z, --compress                 Serve gzip-compressed resources, where applicable.
  --compress.threshold number    Minimum response size in bytes to apply compression. Defaults to 1024 bytes.
  --spa file                     Path to a Single Page App, e.g. app.html.
  --spa.asset-test RegExp        A regular expression to identify an asset file. Defaults to "\.".
  -d, --directory path           Root directory, defaults to the current directory.
  --static.maxage number         Browser cache max-age in milliseconds.
  --static.defer                 If true, serves after `yield next`, allowing any downstream middleware to
                                 respond first.
  --static.index path            Default file name, defaults to `index.html`.
  --index.root path              Index root directory, defaults to --directory or the current directory.
  --index.hidden                 Show hidden files.
  --index.view name              Display mode, either `tiles` or `details`. Defaults to tiles.

  Project home: https://github.com/lwsjs/local-web-server
</code></pre>

## Install

```sh
$ npm install -g local-web-server
```
* * *

&copy; 2013-17 Lloyd Brookes <75pound@gmail.com>. Documented by [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown).
