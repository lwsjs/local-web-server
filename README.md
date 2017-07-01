[![npm (tag)](https://img.shields.io/npm/v/local-web-server/next.svg)](https://www.npmjs.org/package/local-web-server)
[![npm module downloads](https://img.shields.io/npm/dt/local-web-server.svg)](https://www.npmjs.org/package/local-web-server)
[![Build Status](https://travis-ci.org/lwsjs/local-web-server.svg?branch=next)](https://travis-ci.org/lwsjs/local-web-server)
[![Dependency Status](https://david-dm.org/lwsjs/local-web-server/next.svg)](https://david-dm.org/lwsjs/local-web-server/next)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/feross/standard)
[![Join the chat at https://gitter.im/lwsjs/local-web-server](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/lwsjs/local-web-server?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

**This documentation is a work in progress**

# local-web-server

The modular web server for productive full-stack development.

Use this tool to:

* Build fast, modern web applications using any tech, framework or architecture.
* Prototype back-end services (RESTful HTTP API, Microservice, websocket server etc.)
* Monitor activity, analyse performance, compare caching strategies etc.

Features:

* HTTP, HTTPS and HTTP2 support
* Modular. Create, share and consume middleware, view and server plugins.
* URL Rewriting to local or remote destinations
* Single Page Application support
* Response mocking
* Configurable access log
* Route blacklisting
* HTTP Conditional Request support
* Gzip response compression and much more

## Synopsis

This package installs the `ws` command-line tool (take a look at the [usage guide](https://github.com/lwsjs/local-web-server/wiki/CLI-usage)). The most simple use case is to run `ws` without any arguments - this will **host the current directory as a static web site**. Navigating to the server will render your `index.html` or show a directory listing, if you don't have one.

```sh
$ ws
Serving at http://mbp.local:8000, http://127.0.0.1:8000, http://192.168.0.100:8000
```

Another common use case is to **proxy certain requests to a remote server** if, for example, you'd like to use data from a different environment. The following command would proxy requests with a URL beginning with `http://127.0.0.1:8000/api/` to `https://internal-service.local/api/`:

```sh
$ ws --rewrite '/api/* -> https://internal-service.local/api/$1`
Serving at http://mbp.local:8000, http://127.0.0.1:8000, http://192.168.0.100:8000
```

Imagine the network is down or you're working offline, proxied requests to `https://internal-service.local/api/users/1` would fail. In this case, Mock Responses can fill the gap. Export your mock responses from a module.

```js
const users = [
  { "id": 1, "name": "Lloyd", "age": 40 },
  { "id": 2, "name": "Mona", "age": 34 },
  { "id": 3, "name": "Francesco", "age": 24 }
]

/* response mocks for /users */
module.exports = [
  {
    route: '/users',
    responses: [
      /* Respond with 400 Bad Request for PUT and DELETE requests (inappropriate on a collection) */
      { request: { method: 'PUT' }, response: { status: 400 } },
      { request: { method: 'DELETE' }, response: { status: 400 } },
      {
        /* for GET requests return the collection */
        request: { method: 'GET' },
        response: { type: 'application/json', body: users }
      },
      {
        /* for POST requests, create a new user and return its location */
        request: { method: 'POST' },
        response: function (ctx) {
          const newUser = ctx.request.body
          users.push(newUser)
          ctx.status = 201
          ctx.response.set('Location', `/users/${users.length}`)
        }
      }
    ]
  }
]
```

Next, launch `ws` passing in your mock response file: 

```sh
$ ws --mocks example-mocks.js
Serving at http://mbp.local:8000, http://127.0.0.1:8000, http://192.168.0.100:8000
```

Test your mock responses. A `POST` request should return a `201` with a `Location` header and empty body.

```sh
$ curl http://127.0.0.1:8000/users -H 'Content-type: application/json' -d '{ "name": "Anthony" }' -i
HTTP/1.1 201 Created
Vary: Origin
Location: /users/4
Content-Type: text/plain; charset=utf-8
Content-Length: 7
Date: Wed, 28 Jun 2017 20:31:19 GMT
Connection: keep-alive
```

A `GET` to `/users` should return our mock user data, including the record just added.

```sh
$ curl http://127.0.0.1:8000/users
[
  {
    "id": 1,
    "name": "Lloyd",
    "age": 40,
    "nationality": "English"
  },
  {
    "id": 2,
    "name": "Mona",
    "age": 34,
    "nationality": "Palestinian"
  },
  {
    "id": 3,
    "name": "Francesco",
    "age": 24,
    "nationality": "Italian"
  },
  {
    "id": 4,
    "name": "Anthony"
  }
```

## Further Documentation

[See the wiki for plenty more documentation and tutorials](https://github.com/lwsjs/local-web-server/wiki).

## Install

Requires node v7.6 or higher. Install the [previous release](https://github.com/lwsjs/local-web-server/tree/v1.x) for node >= v4.0.0.

```sh
$ npm install -g local-web-server@next
```
* * *

&copy; 2013-17 Lloyd Brookes <75pound@gmail.com>. Documented by [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown).
