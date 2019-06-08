[![view on npm](https://img.shields.io/npm/v/local-web-server.svg)](https://www.npmjs.org/package/local-web-server)
[![npm module downloads](https://img.shields.io/npm/dt/local-web-server.svg)](https://www.npmjs.org/package/local-web-server)
[![Build Status](https://travis-ci.org/lwsjs/local-web-server.svg?branch=master)](https://travis-ci.org/lwsjs/local-web-server)
[![Coverage Status](https://coveralls.io/repos/github/lwsjs/local-web-server/badge.svg?branch=master)](https://coveralls.io/github/lwsjs/local-web-server?branch=master)
[![Dependency Status](https://badgen.net/david/dep/lwsjs/local-web-server)](https://david-dm.org/lwsjs/local-web-server)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/feross/standard)

*Requires node v8 or above. Upgraders, please read the [release notes](https://github.com/lwsjs/local-web-server/releases)*.

# local-web-server

A modular HTTP, HTTPS and HTTP2 command-line web server for productive full-stack development.

Use this tool to:

* Help build any flavour of front-end web application.
    * *Static site, dynamic site with client or server-rendered content, Single Page App, Progessive Web App, Angular or React app etc.*
* Prototype a CORS-enabled back-end service.
    * *RESTful HTTP API, microservice, websocket server, Server Sent Events service etc.*
* Monitor activity, analyse performance, fine-tune caching strategy etc.

Local-web-server is a distribution of [lws](https://github.com/lwsjs/lws) bundled with a "starter pack" of useful middleware.

## Synopsis

This package installs the `ws` command-line tool (take a look at the [usage guide](https://github.com/lwsjs/local-web-server/wiki/CLI-usage)).

### Static web site

Running `ws` without any arguments will host the current directory as a static web site. Navigating to the server will render a directory listing or your `index.html`, if that file exists.

```sh
$ ws
Listening on http://mbp.local:8000, http://127.0.0.1:8000, http://192.168.0.100:8000
```

This clip demonstrates static hosting plus a couple of log output formats - `dev` and `stats`.

<img src="https://imgur.com/download/NJC3POY" width="618px" title="Static static log output">


### Single Page Application

Serving a Single Page Application (an app with client-side routing, e.g. a React or Angular app) is as trivial as specifying the name of your single page:

```sh
$ ws --spa index.html
```

With a static site, requests for typical SPA paths (e.g. `/user/1`, `/login`) would return `404 Not Found` as a file at that location does not exist. However, by marking `index.html` as the SPA you create this rule:

*If a static file is requested (e.g. `/css/style.css`) then serve it, if not (e.g. `/login`) then serve the specified SPA and handle the route client-side.*

[SPA tutorial](https://github.com/lwsjs/local-web-server/wiki/How-to-serve-a-Single-Page-Application-(SPA)).

<img src="https://imgur.com/download/IQVmi8v" title="SPA">

### URL rewriting and proxied requests

Another common use case is to forward certain requests to a remote server.

The following command proxies blog post requests from any path beginning with `/posts/` to `https://jsonplaceholder.typicode.com/posts/`. For example, a request for `/posts/1` would be proxied to `https://jsonplaceholder.typicode.com/posts/1`.

```sh
$ ws --rewrite '/posts/(.*) -> https://jsonplaceholder.typicode.com/posts/$1'
```

This clip demonstrates the above plus use of `--static.extensions` to specify a default file extension and `--verbose` to monitor activity.

<img src="https://imgur.com/download/3flcbJn" width="618px" title="Proxy json requests to remote resource">

### HTTPS

Launch a secure server by setting the `--https` flag. [See the wiki](https://github.com/lwsjs/local-web-server/wiki) for further configuration options and a guide on how to get the "green padlock" in your browser.

```sh
$ ws --https
```

### HTTP2

Uses node's built-in HTTP2 support. [See the wiki](https://github.com/lwsjs/local-web-server/wiki) for further info about HTTPS options and a guide on how to get the "green padlock" in your browser.

```sh
$ ws --http2
```

## Features

* Full control over request handling. The middleware stack is personalisable - use one or more custom or pre-built middleware plugins.
* Single Page Application (SPA) support
* URL Rewriting
* Proxy requests to remote resources
* HTTP Conditional Request support
* Range request support
* Gzip response compression
* HTTP Basic Authentication
* Configurable access log
* Route blacklisting and more


## Further Documentation

[See the wiki for plenty more documentation and tutorials](https://github.com/lwsjs/local-web-server/wiki).

## Install

**Requires node v8 or above**. Install the [previous release](https://github.com/lwsjs/local-web-server/tree/v1.x) for node >= v4.0.0.

```sh
$ npm install -g local-web-server
```

* * *

&copy; 2013-19 Lloyd Brookes \<75pound@gmail.com\>. Documented by [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown).
