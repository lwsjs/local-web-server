[![view on npm](http://img.shields.io/npm/v/local-web-server.svg)](https://www.npmjs.org/package/local-web-server)
[![npm module downloads](http://img.shields.io/npm/dt/local-web-server.svg)](https://www.npmjs.org/package/local-web-server)
[![Build Status](https://travis-ci.org/75lb/local-web-server.svg?branch=master)](https://travis-ci.org/75lb/local-web-server)
[![Dependency Status](https://david-dm.org/75lb/local-web-server.svg)](https://david-dm.org/75lb/local-web-server)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/feross/standard)

***This is the documentation for the next version. For the previous release, see the `prev` branch. To install this prerelease: `$ npm i -g local-web-server@^1.0.0-beta`***

# local-web-server
A simple web-server for productive front-end development. Typical use cases:

* Front-end Development
  * Static or Single Page App development
  * reroute paths to local or remote resources
  * Bundle with your front-end project
  * Very little configuration, just a few options
  * Outputs a dynamic statistics view to the terminal
  * Configurable log output, compatible with [Goaccess, Logstalgia and glTail](https://github.com/75lb/local-web-server/blob/master/doc/visualisation.md)
* Back-end service mocking
  * Prototype a web service, microservice, REST API etc.
  * CORS-friendly, all origins allowed by default.
* Proxy server
  * Useful to workaround CORS issues with remote servers
* File sharing

**Requires node v4.0.0 or higher**.

## Synopsis
local-web-server is a simple command-line tool. To use it, from your project directory run `ws`.

<pre><code>$ ws --help

<strong>local-web-server</strong>

  A simple web-server for productive front-end development.

<strong>Synopsis</strong>

  $ ws [&lt;server options&gt;]
  $ ws --config
  $ ws --help

<strong>Server</strong>

  -p, --port number              Web server port.
  -d, --directory path           Root directory, defaults to the current directory.
  -f, --log-format string        If a format is supplied an access log is written to stdout. If
                                 not, a dynamic statistics view is displayed. Use a preset ('none',
                                 'dev','combined', 'short', 'tiny' or 'logstalgia') or supply a
                                 custom format (e.g. ':method -> :url').
  -r, --rewrite expression ...   A list of URL rewrite rules. For each rule, separate the 'from'
                                 and 'to' routes with '->'. Whitespace surrounded the routes is
                                 ignored. E.g. '/from -> /to'.
  -s, --spa file                 Path to a Single Page App, e.g. app.html.
  -c, --compress                 Serve gzip-compressed resources, where applicable.
  -b, --forbid path ...          A list of forbidden routes.
  -n, --no-cache                 Disable etag-based caching -forces loading from disk each request.
  --verbose                      Verbose output, useful for debugging.

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

### Single Page Application

You're building a web app with client-side routing, so mark `index.html` as the SPA.
```sh
$ ws --spa index.html
```

By default, typical SPA urls (e.g. `/user/1`, `/login`) would return `404 Not Found` as a file does not exist with that path. By marking `index.html` as the SPA you create this rule:

*If a static file at the requested path exists (e.g. `/css/style.css`) then serve it, if it does not (e.g. `/login`) then serve the specified SPA and handle the route client-side.*

[Example](https://github.com/75lb/local-web-server/tree/master/example/spa).

### URL rewriting

Your application requested `/css/style.css` but it's stored at `/build/css/style.css`. To avoid a 404 you need a rewrite rule:

```sh
$ ws --rewrite '/css/style.css -> /build/css/style.css'
```

Or, more generally (matching any stylesheet under `/css`):

```sh
$ ws --rewrite '/css/:stylesheet -> /build/css/:stylesheet'
```

With a deep CSS directory structure it may be easier to mount the entire contents of `/build/css` to the `/css` path:

```sh
$ ws --rewrite '/css/* -> /build/css/$1'
```

this rewrites `/css/a` as `/build/css/a`, `/css/a/b/c` as `/build/css/a/b/c` etc.

#### Proxied requests

If the `to` URL contains a remote host, local-web-server will act as a proxy - fetching and responding with the remote resource.

Mount the npm registry locally:
```sh
$ ws --rewrite '/npm/* -> http://registry.npmjs.org/$1'
```

Map local requests for repo data to the Github API:
```sh
$ ws --rewrite '/:user/repos/:name -> https://api.github.com/repos/:user/:name'
```

[Example](https://github.com/75lb/local-web-server/tree/master/example/rewrite).

### Mock Responses

Mock a data service, serve any custom/dynamic content.

A mock definition maps a route to a response. Mock a home page.
```json
{
  "mocks": [
    {
      "route": "/",
      "response": {
        "body": "<h1>Welcome to the Mock Responses example</h1>"
      }
    }
  ]
}
```

Conditional response, depending on the request.
```json
{
  "mocks": [
    {
      "route": "/two",
      "request": { "accepts": "xml" },
      "response": {
        "body": "<result id='2' name='whatever' />"
      }
    }
  ]
}
```

Multiple potential responses. First request to match.
```json
{
  "mocks": [
    {
      "route": "/three",
      "responses": [
        {
          "request": { "method": "GET" },
          "response": {
            "body": "<h1>Mock response for 'GET' request on /three</h1>"
          }
        },
        {
          "request": { "method": "POST" },
          "response": {
            "status": 400,
            "body": { "message": "That method is not allowed." }
          }
        }
      ]
    }
  ]
}
```

More dynamic response.
```json
{
  "mocks": [
    {
      "route": "/four",
      "module": "/mocks/four.js"
    }
  ]
}
```

Tokens in the route are passed to the response.
```json
{
  "mocks": [
    {
      "route": "/five/:id\\?name=:name",
      "module": "/mocks/five.js"
    }
  ]
}
```

[Example](https://github.com/75lb/local-web-server/tree/master/example/mock).

### Stored config

Use the same port and blacklist every time? Persist it to `package.json`:
```json
{
  "name": "example",
  "version": "1.0.0",
  "local-web-server": {
    "port": 8100,
    "forbid": "*.json"
  }
}
```

or `.local-web-server.json`
```json
{
  "port": 8100,
  "forbid": "*.json"
}
```

local-web-server will merge and use all config found, searching from the current directory upward. In the case both `package.json` and `.local-web-server.json` config is found in the same directory, `.local-web-server.json` will take precedence. Command-line options take precedence over all.

To inspect stored config, run:
```sh
$ ws --config
```

### Logging
By default, local-web-server outputs a simple, dynamic statistics view. To see traditional web server logs, use `--log-format`:

```sh
$ ws --log-format combined
serving at http://localhost:8000
::1 - - [16/Nov/2015:11:16:52 +0000] "GET / HTTP/1.1" 200 12290 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2562.0 Safari/537.36"
```

The format value supplied is passed directly to [morgan](https://github.com/expressjs/morgan). The exception is `--log-format none` which disables all output.

### Access Control

By default, access to all files is allowed (including dot files). Use `--forbid` to establish a blacklist:
```sh
$ ws --forbid '*.json' '*.yml'
serving at http://localhost:8000
```

[Example](https://github.com/75lb/local-web-server/tree/master/example/forbid).

### Other usage

#### Debugging

Prints information about loaded middleware, arguments, remote proxy fetches etc.
```sh
$ ws --verbose
```

#### Compression

Serve gzip-compressed resources, where applicable
```sh
$ ws --compress
```

#### Disable caching

Disable etag response headers, forcing resources to be served in full every time.
```sh
$ ws --no-cache
```

#### mime-types
You can set additional mime-type/extension mappings, or override the defaults by setting a `mime` value in the stored config. This value is passed directly to [mime.define()](https://github.com/broofa/node-mime#mimedefine). Example:

```json
{
  "mime": {
    "text/plain": [ "php", "pl" ]
  }
}
```

[Example](https://github.com/75lb/local-web-server/tree/master/example/mime-override).

#### Log Visualisation
Instructions for how to visualise log output using goaccess, logstalgia or gltail [here](https://github.com/75lb/local-web-server/blob/master/doc/visualisation.md).

## Install
Ensure [node.js](http://nodejs.org) is installed first. Linux/Mac users may need to run the following commands with `sudo`.

```sh
$ npm install -g local-web-server
```

This will install the `ws` tool globally. To see the available options, run:
```sh
$ ws --help
```

## Distribute with your project
The standard convention with client-server applications is to add an `npm start` command to launch the server component.

1\. Install the server as a dev dependency

```sh
$ npm install local-web-server --save-dev
```

2\. Add a `start` command to your `package.json`:

```json
{
  "name": "example",
  "version": "1.0.0",
  "local-web-server": {
    "port": 8100,
    "forbid": "*.json"
  },
  "scripts": {
    "start": "ws"
  }
}
```

3\. Document how to build and launch your site

```sh
$ npm install
$ npm start
serving at http://localhost:8100
```

## API Reference


* [local-web-server](#module_local-web-server)
  * [localWebServer([options])](#exp_module_local-web-server--localWebServer) ⇒ <code>[KoaApplication](https://github.com/koajs/koa/blob/master/docs/api/index.md#application)</code> ⏏
    * [~rewriteRule](#module_local-web-server--localWebServer..rewriteRule)

<a name="exp_module_local-web-server--localWebServer"></a>
### localWebServer([options]) ⇒ <code>[KoaApplication](https://github.com/koajs/koa/blob/master/docs/api/index.md#application)</code> ⏏
Returns a Koa application you can launch or mix into an existing app.

**Kind**: Exported function  
**Params**
- [options] <code>object</code> - options
  - [.static] <code>object</code> - koa-static config
    - [.root] <code>string</code> <code> = &quot;.&quot;</code> - root directory
    - [.options] <code>string</code> - [options](https://github.com/koajs/static#options)
  - [.serveIndex] <code>object</code> - koa-serve-index config
    - [.path] <code>string</code> <code> = &quot;.&quot;</code> - root directory
    - [.options] <code>string</code> - [options](https://github.com/expressjs/serve-index#options)
  - [.forbid] <code>Array.&lt;string&gt;</code> - A list of forbidden routes, each route being an [express route-path](http://expressjs.com/guide/routing.html#route-paths).
  - [.spa] <code>string</code> - specify an SPA file to catch requests for everything but static assets.
  - [.log] <code>object</code> - [morgan](https://github.com/expressjs/morgan) config
    - [.format] <code>string</code> - [log format](https://github.com/expressjs/morgan#predefined-formats)
    - [.options] <code>object</code> - [options](https://github.com/expressjs/morgan#options)
  - [.compress] <code>boolean</code> - Serve gzip-compressed resources, where applicable
  - [.mime] <code>object</code> - A list of mime-type overrides, passed directly to [mime.define()](https://github.com/broofa/node-mime#mimedefine)
  - [.rewrite] <code>[Array.&lt;rewriteRule&gt;](#module_local-web-server--localWebServer..rewriteRule)</code> - One or more rewrite rules
  - [.verbose] <code>boolean</code> - Print detailed output, useful for debugging

**Example**  
```js
const localWebServer = require('local-web-server')
localWebServer().listen(8000)
```
<a name="module_local-web-server--localWebServer..rewriteRule"></a>
#### localWebServer~rewriteRule
The `from` and `to` routes are specified using [express route-paths](http://expressjs.com/guide/routing.html#route-paths)

**Kind**: inner typedef of <code>[localWebServer](#exp_module_local-web-server--localWebServer)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| from | <code>string</code> | request route |
| to | <code>string</code> | target route |

**Example**  
```json
{
  "rewrite": [
    { "from": "/css/*", "to": "/build/styles/$1" },
    { "from": "/npm/*", "to": "http://registry.npmjs.org/$1" },
    { "from": "/:user/repos/:name", "to": "https://api.github.com/repos/:user/:name" }
  ]
}
```

* * *

&copy; 2015 Lloyd Brookes <75pound@gmail.com>. Documented by [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown).
