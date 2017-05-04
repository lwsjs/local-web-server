[![view on npm](http://img.shields.io/npm/v/local-web-server.svg)](https://www.npmjs.org/package/local-web-server)
[![npm module downloads](http://img.shields.io/npm/dt/local-web-server.svg)](https://www.npmjs.org/package/local-web-server)
[![Build Status](https://travis-ci.org/lwsjs/local-web-server.svg?branch=master)](https://travis-ci.org/lwsjs/local-web-server)
[![Dependency Status](https://david-dm.org/lwsjs/local-web-server.svg)](https://david-dm.org/lwsjs/local-web-server)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/feross/standard)
[![Join the chat at https://gitter.im/lwsjs/local-web-server](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/lwsjs/local-web-server?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

***This project does not yet use the latest Koa modules (therefore some dependencies are out of date) because the recent Koa upgrade made node v7.6 the minimum supported version. This tool supports node v4 and higher. The next version of this tool is in progress and [available for preview](https://github.com/lwsjs/local-web-server/tree/next).***

# local-web-server
A simple web-server for productive front-end development. Typical use cases:

* Front-end Development
  * Static or Single Page App development
  * Re-route paths to local or remote resources
  * Efficient, predictable, entity-tag-powered conditional request handling (no need to 'Disable Cache' in DevTools, slowing page-load down)
  * Bundle with your front-end project
  * Very little configuration, just a few options
  * Outputs a dynamic statistics view to the terminal
  * Configurable log output, compatible with [Goaccess, Logstalgia and glTail](https://github.com/lwsjs/local-web-server/blob/master/doc/visualisation.md)
* Back-end service mocking
  * Prototype a web service, microservice, REST API etc.
  * Mocks are defined with config (static), or code (dynamic).
  * CORS-friendly, all origins allowed by default.
* Proxy server
  * Map local routes to remote servers. Removes CORS pain when consuming remote services.
* HTTPS server
  * HTTPS is strictly required by some modern techs (ServiceWorker, Media Capture and Streams etc.)
* File sharing

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
  --key file                     SSL key. Supply along with --cert to launch a https server.
  --cert file                    SSL cert. Supply along with --key to launch a https server.
  --https                        Enable HTTPS using a built-in key and cert, registered to the
                                 domain 127.0.0.1.
  --verbose                      Verbose output, useful for debugging.

<strong>Misc</strong>

  -h, --help    Print these usage instructions.
  --config      Print the stored config.

  Project home: https://github.com/lwsjs/local-web-server
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

**All paths/routes are specified using [express syntax](http://expressjs.com/guide/routing.html#route-paths)**. To run the example projects linked below, clone the project, move into the example directory specified, run `ws`.

### Static site

Fire up your static site on the default port:
```sh
$ ws
serving at http://localhost:8000
```

[Example](https://github.com/lwsjs/local-web-server/tree/master/example/simple).

### Single Page Application

You're building a web app with client-side routing, so mark `index.html` as the SPA.
```sh
$ ws --spa index.html
```

By default, typical SPA paths (e.g. `/user/1`, `/login`) would return `404 Not Found` as a file does not exist with that path. By marking `index.html` as the SPA you create this rule:

*If a static file at the requested path exists (e.g. `/css/style.css`) then serve it, if it does not (e.g. `/login`) then serve the specified SPA and handle the route client-side.*

[Example](https://github.com/lwsjs/local-web-server/tree/master/example/spa).

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

[Example](https://github.com/lwsjs/local-web-server/tree/master/example/rewrite).

### Mock Responses

Mocks give you full control over the response headers and body returned to the client. They can be used to return anything from a simple html string to a resourceful REST API. Typically, they're used to mock services but can be used for anything.

In the config, define an array called `mocks`. Each mock definition maps a <code>[route](http://expressjs.com/guide/routing.html#route-paths)</code> to a `response`. A simple home page:
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

Under the hood, the property values from the `response` object are written onto the underlying [koa response object](https://github.com/koajs/koa/blob/master/docs/api/response.md). You can set any valid koa response properies, for example [type](https://github.com/koajs/koa/blob/master/docs/api/response.md#responsetype-1):
```json
{
  "mocks": [
    {
      "route": "/",
      "response": {
        "type": "text/plain",
        "body": "<h1>Welcome to the Mock Responses example</h1>"
      }
    }
  ]
}
```

#### Conditional Response

To define a conditional response, set a `request` object on the mock definition. The `request` value acts as a query - the response defined will only be returned if each property of the `request` query matches. For example, return an XML response *only* if the request headers include `accept: application/xml`, else return 404 Not Found.

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

#### Multiple Potential Responses

To specify multiple potential responses, set an array of mock definitions to the `responses` property. The first response with a matching request query will be sent. In this example, the client will get one of two responses depending on the request method:

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

#### Dynamic Response

The examples above all returned static data. To define a dynamic response, create a mock module. Specify its path in the `module` property:
```json
{
  "mocks": [
    {
      "route": "/four",
      "module": "/mocks/stream-self.js"
    }
  ]
}
```

Here's what the `stream-self` module looks like. The module should export a mock definition (an object, or array of objects, each with a `response` and optional `request`). In this example, the module simply streams itself to the response but you could set `body` to *any* [valid value](https://github.com/koajs/koa/blob/master/docs/api/response.md#responsebody-1).
```js
const fs = require('fs')

module.exports = {
  response: {
    body: fs.createReadStream(__filename)
  }
}
```

#### Response function

For more power, define the response as a function. It will receive the [koa context](https://github.com/koajs/koa/blob/master/docs/api/context.md) as its first argument. Now you have full programmatic control over the response returned.
```js
module.exports = {
  response: function (ctx) {
    ctx.body = '<h1>I can do anything i want.</h1>'
  }
}
```

If the route contains tokens, their values are passed to the response. For example, with this mock...
```json
{
  "mocks": [
    {
      "route": "/players/:id",
      "module": "/mocks/players.js"
    }
  ]
}
```

...the `id` value is passed to the `response` function. For example, a path of `/players/10?name=Lionel` would pass `10` to the response function. Additional, the value `Lionel` would be available on `ctx.query.name`:
```js
module.exports = {
  response: function (ctx, id) {
    ctx.body = `<h1>id: ${id}, name: ${ctx.query.name}</h1>`
  }
}
```

#### RESTful Resource example

Here's an example of a REST collection (users). We'll create two routes, one for actions on the resource collection, one for individual resource actions.

```json
{
  "mocks": [
    { "route": "/users", "module": "/mocks/users.js" },
    { "route": "/users/:id", "module": "/mocks/user.js" }
  ]
}
```

Define a module (`users.json`) defining seed data:

```json
[
  { "id": 1, "name": "Lloyd", "age": 40, "nationality": "English" },
  { "id": 2, "name": "Mona", "age": 34, "nationality": "Palestinian" },
  { "id": 3, "name": "Francesco", "age": 24, "nationality": "Italian" }
]
```

The collection module:

```js
const users = require('./users.json')

/* responses for /users */
const mockResponses = [
  /* Respond with 400 Bad Request for PUT and DELETE - inappropriate on a collection */
  { request: { method: 'PUT' }, response: { status: 400 } },
  { request: { method: 'DELETE' }, response: { status: 400 } },
  {
    /* for GET requests return a subset of data, optionally filtered on 'minAge' and 'nationality' */
    request: { method: 'GET' },
    response: function (ctx) {
      ctx.body = users.filter(user => {
        const meetsMinAge = (user.age || 1000) >= (Number(ctx.query.minAge) || 0)
        const requiredNationality = user.nationality === (ctx.query.nationality || user.nationality)
        return meetsMinAge && requiredNationality
      })
    }
  },
  {
    /* for POST requests, create a new user and return the path to the new resource */
    request: { method: 'POST' },
    response: function (ctx) {
      const newUser = ctx.request.body
      users.push(newUser)
      newUser.id = users.length
      ctx.status = 201
      ctx.response.set('Location', `/users/${newUser.id}`)
    }
  }
]

module.exports = mockResponses
```

The individual resource module:

```js
const users = require('./users.json')

/* responses for /users/:id */
const mockResponses = [
  /* don't support POST here */
  { request: { method: 'POST' }, response: { status: 400 } },

  /* for GET requests, return a particular user */
  {
    request: { method: 'GET' },
    response: function (ctx, id) {
      ctx.body = users.find(user => user.id === Number(id))
    }
  },

  /* for PUT requests, update the record */
  {
    request: { method: 'PUT' },
    response: function (ctx, id) {
      const updatedUser = ctx.request.body
      const existingUserIndex = users.findIndex(user => user.id === Number(id))
      users.splice(existingUserIndex, 1, updatedUser)
      ctx.status = 200
    }
  },

  /* DELETE request: remove the record */
  {
    request: { method: 'DELETE' },
    response: function (ctx, id) {
      const existingUserIndex = users.findIndex(user => user.id === Number(id))
      users.splice(existingUserIndex, 1)
      ctx.status = 200
    }
  }
]

module.exports = mockResponses
```

[Example](https://github.com/lwsjs/local-web-server/tree/master/example/mock).

### HTTPS Server

Some modern techs (ServiceWorker, any `MediaDevices.getUserMedia()` request etc.) *must* be served from a secure origin (HTTPS). To launch an HTTPS server, supply a `--key` and `--cert` to local-web-server, for example:

```
$ ws --key localhost.key --cert localhost.crt
```

If you don't have a key and certificate it's trivial to create them. You do not need third-party verification (Verisign etc.) for development purposes. To get the green padlock in the browser, the certificate..

* must have a `Common Name` value matching the FQDN of the server
* must be verified by a Certificate Authority (but we can overrule this - see below)

First create a certificate:

1. Install openssl.

  `$ brew install openssl`

2. Generate a RSA private key.

  `$ openssl genrsa -des3 -passout pass:x -out ws.pass.key 2048`

3. Create RSA key.

  ```
  $ openssl rsa -passin pass:x -in ws.pass.key -out ws.key
  ```

4. Create certificate request. The command below will ask a series of questions about the certificate owner. The most imporant answer to give is for `Common Name`, you can accept the default values for the others.  **Important**: you **must** input your server's correct FQDN (`dev-server.local`, `laptop.home` etc.) into the `Common Name` field. The cert is only valid for the domain specified here. You can find out your computers host name by running the command `hostname`. For example, mine is `mba3.home`.

  `$ openssl req -new -key ws.key -out ws.csr`

5. Generate self-signed certificate.

  `$ openssl x509 -req -days 365 -in ws.csr -signkey ws.key -out ws.crt`

6. Clean up files we're finished with

  `$ rm ws.pass.key ws.csr`

7. Launch HTTPS server. In iTerm, control-click the first URL (with the hostname matching `Common Name`) to launch your browser.

  ```
  $ ws --key ws.key --cert ws.crt
  serving at https://mba3.home:8010, https://127.0.0.1:8010, https://192.168.1.203:8010
  ```

Chrome and Firefox will still complain your certificate has not been verified by a Certificate Authority. Firefox will offer you an `Add an exception` option, allowing you to ignore the warning and manually mark the certificate as trusted. In Chrome on Mac, you can manually trust the certificate another way:

1. Open Keychain
2. Click File -> Import. Select the `.crt` file you created.
3. In the `Certificates` category, double-click the cert you imported.
4. In the `trust` section, underneath `when using this certificate`, select `Always Trust`.

Now you have a valid, trusted certificate for development.

#### Built-in certificate
As a quick win, you can run `ws` with the `https` flag. This will launch an HTTPS server using a [built-in certificate](https://github.com/lwsjs/local-web-server/tree/master/ssl) registered to the domain 127.0.0.1.

### Stored config

Use the same options every time? Persist then to `package.json`:
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

local-web-server will merge and use all config found, searching from the current directory upward. In the case both `package.json` and `.local-web-server.json` config is found in the same directory, `.local-web-server.json` will take precedence. Options set on the command line take precedence over all.

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

[Example](https://github.com/lwsjs/local-web-server/tree/master/example/forbid).

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

[Example](https://github.com/lwsjs/local-web-server/tree/master/example/mime-override).

#### Log Visualisation
Instructions for how to visualise log output using goaccess, logstalgia or gltail [here](https://github.com/lwsjs/local-web-server/blob/master/doc/visualisation.md).

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

&copy; 2013-16 Lloyd Brookes <75pound@gmail.com>. Documented by [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown).
