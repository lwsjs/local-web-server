[![npm (tag)](https://img.shields.io/npm/v/local-web-server.svg)](https://www.npmjs.org/package/local-web-server)
[![npm module downloads](https://img.shields.io/npm/dt/local-web-server.svg)](https://www.npmjs.org/package/local-web-server)
[![Build Status](https://travis-ci.org/lwsjs/local-web-server.svg?branch=master)](https://travis-ci.org/lwsjs/local-web-server)
[![Coverage Status](https://coveralls.io/repos/github/lwsjs/local-web-server/badge.svg?branch=master)](https://coveralls.io/github/lwsjs/local-web-server?branch=master)
[![dependencies Status](https://david-dm.org/lwsjs/local-web-server/master/status.svg)](https://david-dm.org/lwsjs/local-web-server/master)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/feross/standard)
[![Join the chat at https://gitter.im/lwsjs/local-web-server](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/lwsjs/local-web-server?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

**Requires node v7.6 or above. Upgraders, please read the [release notes](https://github.com/lwsjs/local-web-server/releases)**.

# local-web-server

The modular web server for productive full-stack development.

Use this tool to:

* Build any flavour of web application (static site, dynamic site with client or server-rendered content, Single Page App, Progessive Web App, Angular or React app etc.)
* Prototype any CORS-enabled back-end service (e.g. RESTful HTTP API or Microservice using websockets, Server Sent Events etc.)
* Monitor activity, analyse performance, experiment with caching strategies etc.
* Build your own, personalised CLI web server tool

Features:

* Modular, extensible and easy to personalise. Create, share and consume only plugins which match your requirements.
* Powerful, extensible command-line interface (add your own commands and options)
* HTTP, HTTPS and HTTP2 support (HTTP2 requires node v8.4.0 or above)
* URL Rewriting to local or remote destinations
* Single Page Application support
* Response mocking
* Configurable access log
* Route blacklisting
* HTTP Conditional and Range request support
* Gzip response compression, HTTP Basic Authentication and much more

## Synopsis

This package installs the `ws` command-line tool (take a look at the [usage guide](https://github.com/lwsjs/local-web-server/wiki/CLI-usage)).

### Static web site

The most simple use case is to run `ws` without any arguments - this will **host the current directory as a static web site**. Navigating to the server will render a directory listing or your `index.html`, if that file exists.

```sh
$ ws
Serving at http://mbp.local:8000, http://127.0.0.1:8000, http://192.168.0.100:8000
```

### Single Page Application

Serving a Single Page Application (an app with client-side routing, e.g. a React or Angular app) is as trivial as specifying the name of your single page:

```sh
$ ws --spa index.html
Serving at http://mbp.local:8000, http://127.0.0.1:8000, http://192.168.0.100:8000
```

By default, requests for typical SPA paths (e.g. `/user/1`, `/login`) return `404 Not Found` as a file at that location does not exist. By marking `index.html` as the SPA you create this rule:

*If a static file is requested (e.g. `/css/style.css`) then serve it, if not (e.g. `/login`) then serve the specified SPA and handle the route client-side.*

[Read more](https://github.com/lwsjs/local-web-server/wiki/How-to-serve-a-Single-Page-Application-(SPA)).

### URL rewriting and proxied requests

Another common use case is to **re-route certain requests to a remote server** if, for example, you'd like to use data from a different environment. The following command would proxy requests with a URL beginning with `http://127.0.0.1:8000/api/` to `https://internal-service.local/api/`:

```sh
$ ws --rewrite '/api/* -> https://internal-service.local/api/$1'
Serving at http://mbp.local:8000, http://127.0.0.1:8000, http://192.168.0.100:8000
```

### HTTPS

Launching a secure server is as simple as setting the `--https` flag. [See the wiki](https://github.com/lwsjs/local-web-server/wiki) for further configuration options and a guide on how to get the "green padlock" in your browser.

```sh
$ ws --https
Serving at https://mbp.local:8000, https://127.0.0.1:8000, https://192.168.0.100:8000
```

### HTTP2

Uses node's built-in HTTP2 support. HTTP2 servers are always secure using local-web-server's built-in SSL certificates (by default) or those supplied by `--cert`, `--key` or `--pfx`. [See the wiki](https://github.com/lwsjs/local-web-server/wiki) for further info about HTTPS options and a guide on how to get the "green padlock" in your browser.

```sh
$ ws --http2
Serving at https://mbp.local:8000, https://127.0.0.1:8000, https://192.168.0.100:8000
```

### Mock responses

Imagine the network is down or you're working offline, proxied requests to `https://internal-service.local/api/users/1` would fail. In this case, Mock Responses can fill the gap. Mocks are defined in a module which can be reused between projects.

Trivial example - respond to a request for `/rivers` with some JSON. Save the following Javascript in a file named `example-mocks.js`.

```js
module.exports = MockBase => class MockRivers extends MockBase {
  mocks () {
    return {
      route: '/rivers',
      responses: [
        {
          response: {
            type: 'json',
            body: [
              { name: 'Volga', drainsInto: 'Caspian Sea' },
              { name: 'Danube', drainsInto: 'Black Sea' },
              { name: 'Ural', drainsInto: 'Caspian Sea' },
              { name: 'Dnieper', drainsInto: 'Black Sea' }
            ]
          }
        }
      ]
    }
  }
}
```

Launch `ws` passing in your mocks module.

```sh
$ ws --mocks example-mocks.js
Serving at http://mbp.local:8000, http://127.0.0.1:8000, http://192.168.0.100:8000
```

GET your rivers.

```sh
$ curl http://127.0.0.1:8000/rivers
[
  {
    "name": "Volga",
    "drainsInto": "Caspian Sea"
  },
  {
    "name": "Danube",
    "drainsInto": "Black Sea"
  },
  {
    "name": "Ural",
    "drainsInto": "Caspian Sea"
  },
  {
    "name": "Dnieper",
    "drainsInto": "Black Sea"
  }
]
```

See [the tutorials](https://github.com/lwsjs/local-web-server/wiki#tutorials) for more information and examples about mock responses.

## Further Documentation

[See the wiki for plenty more documentation and tutorials](https://github.com/lwsjs/local-web-server/wiki).

## Install

**Requires node v7.6 or above**. Install the [previous release](https://github.com/lwsjs/local-web-server/tree/v1.x) for node >= v4.0.0.

```sh
$ npm install -g local-web-server
```
* * *

&copy; 2013-18 Lloyd Brookes <75pound@gmail.com>. Documented by [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown).
