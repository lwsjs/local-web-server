[![view on npm](http://img.shields.io/npm/v/local-web-server.svg)](https://www.npmjs.org/package/local-web-server)
[![npm module downloads](http://img.shields.io/npm/dt/local-web-server.svg)](https://www.npmjs.org/package/local-web-server)
[![Build Status](https://travis-ci.org/75lb/local-web-server.svg?branch=master)](https://travis-ci.org/75lb/local-web-server)
[![Dependency Status](https://david-dm.org/75lb/local-web-server.svg)](https://david-dm.org/75lb/local-web-server)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/feross/standard)
[![Join the chat at https://gitter.im/75lb/local-web-server](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/75lb/local-web-server?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

***Requires node v4.0.0 or higher. Install the [previous release](https://github.com/75lb/local-web-server/tree/prev) for older node support.***

# local-web-server
An application shell for building a simple, command-line web server for productive web development. It contains no middleware of its own but will load default-stack unless you specify otherwise.

It is trivial is bundle and deploy with your project. Also deploys to heroku well for demo projects.

It comes with some middleware built-in, which you need not use but will get you up and running for the following use cases:

* Static or Single Page Application front-end development where you have
  * No backend, an existing remote API or need to mock-up an API.

Application Shell
  * HTTP or HTTPS server
    * HTTPS is strictly required by some modern techs (ServiceWorker, Media Capture and Streams etc.)
  * Add your middleware
    * Use any combination of built-in and custom middleware
    * specify options (for command line or config)
    * Accepts Koa v1 or 2 middleware
  * Bundle with your front-end project
  * Configuration is via json file or command-line (latter taking precedence)
  * Outputs a dynamic statistics view to the terminal


Built-in Middleware (all optional)
  * Rewrite routes to local or remote resources
  * Efficient, predictable, entity-tag-powered conditional request handling (no need to 'Disable Cache' in DevTools, slowing page-load down)
  * Configurable log output, compatible with [Goaccess, Logstalgia and glTail](https://github.com/75lb/local-web-server/blob/master/doc/visualisation.md)
  * Proxy server
    * Map local routes to remote servers. Removes CORS pain when consuming remote services.
  * Back-end service mocking
    * Prototype a web service, microservice, REST API etc.
    * Mocks are defined with config (static), or code (dynamic).
  * CORS-friendly, all origins allowed by default.

## Synopsis
local-web-server is a command-line tool. To serve the current directory, run `ws`.

<pre><code>$ ws --help

<strong>local-web-server</strong>

  A simple web-server for productive front-end development.

<strong>Synopsis</strong>

  $ ws [--verbose] [<server options>] [<middleware options>]
  $ ws --config
  $ ws --help

<strong>Server</strong>

  -p, --port number   Web server port.
  --key file          SSL key. Supply along with --cert to launch a https server.
  --cert file         SSL cert. Supply along with --key to launch a https server.
  --https             Enable HTTPS using a built-in key and cert, registered to the domain
                      127.0.0.1.

<strong>Middleware</strong>

  -r, --rewrite expression ...   A list of URL rewrite rules. For each rule, separate the 'from' and 'to'
                                 routes with '->'. Whitespace surrounded the routes is ignored. E.g. '/from ->
                                 /to'.
  -b, --forbid path ...          A list of forbidden routes.
  -n, --no-cache                 Disable etag-based caching -forces loading from disk each request.
  -c, --compress                 Serve gzip-compressed resources, where applicable.
  -f, --log-format string        If a format is supplied an access log is written to stdout. If not, a dynamic
                                 statistics view is displayed. Use a preset ('none', 'dev','combined',
                                 'short', 'tiny' or 'logstalgia') or supply a custom format (e.g. ':method ->
                                 :url').
  -s, --spa file                 Path to a Single Page App, e.g. app.html.
  -d, --directory path           Root directory, defaults to the current directory.

<strong>Misc</strong>

  -h, --help    Print these usage instructions.
  --config      Print the stored config.

  Project home: https://github.com/75lb/local-web-server
</code></pre>

## Examples

For the examples below, we assume we're in a project directory looking like this:

```sh
.
├── css
│   └── style.css
├── index.html
└── package.json
```

All paths/routes are specified using [express syntax](http://expressjs.com/guide/routing.html#route-paths). To run the example projects linked below, clone the project, move into the example directory specified, run `ws`.

### Static site

Fire up your static site on the default port:
```sh
$ ws
serving at http://localhost:8000
```

[Example](https://github.com/75lb/local-web-server/tree/master/example/simple).

## Install
Ensure [node.js](http://nodejs.org) is installed first. Linux/Mac users may need to run the following commands with `sudo`.

```sh
$ npm install -g local-web-server
```
* * *

&copy; 2013-16 Lloyd Brookes <75pound@gmail.com>. Documented by [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown).
