[![view on npm](https://badgen.net/npm/v/local-web-server)](https://www.npmjs.org/package/local-web-server)
[![npm module downloads](https://badgen.net/npm/dt/local-web-server)](https://www.npmjs.org/package/local-web-server)
[![Gihub repo dependents](https://badgen.net/github/dependents-repo/lwsjs/local-web-server)](https://github.com/lwsjs/local-web-server/network/dependents?dependent_type=REPOSITORY)
[![Gihub package dependents](https://badgen.net/github/dependents-pkg/lwsjs/local-web-server)](https://github.com/lwsjs/local-web-server/network/dependents?dependent_type=PACKAGE)
[![Build Status](https://travis-ci.org/lwsjs/local-web-server.svg?branch=master)](https://travis-ci.org/lwsjs/local-web-server)
[![Coverage Status](https://coveralls.io/repos/github/lwsjs/local-web-server/badge.svg)](https://coveralls.io/github/lwsjs/local-web-server)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/feross/standard)

*Upgraders, please read the [release notes](https://github.com/lwsjs/local-web-server/releases)*.

# local-web-server

A lean, modular web server for rapid full-stack development.

* Supports HTTP, HTTPS and HTTP2.
* Small and 100% personalisable. Load and use only the behaviour required by your project.
* Attach a custom view to personalise how activity is visualised.
* Programmatic and command-line interfaces.

Use this tool to:

* Build any type of front-end web application (static, dynamic, Single Page App, Progessive Web App, React etc).
* Prototype a back-end service (REST API, microservice, websocket, Server Sent Events service etc).
* Monitor activity, analyse performance, experiment with caching strategy etc.

Local-web-server is a distribution of [lws](https://github.com/lwsjs/lws) bundled with a "starter pack" of useful middleware.

## Synopsis

This package installs the `ws` command-line tool (take a look at the [usage guide](https://github.com/lwsjs/local-web-server/wiki/CLI-usage)).

### Static web site

Running `ws` without any arguments will host the current directory as a static web site. Navigating to the server will render a directory listing or your `index.html`, if that file exists.

```sh
$ ws
Listening on http://mbp.local:8000, http://127.0.0.1:8000, http://192.168.0.100:8000
```

[Static files tutorial](https://github.com/lwsjs/local-web-server/wiki/How-to-serve-static-files).

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

[Rewrite tutorial](https://github.com/lwsjs/local-web-server/wiki/How-to-rewrite-URLs-to-local-or-remote-destinations).

This clip demonstrates the above plus use of `--static.extensions` to specify a default file extension and `--verbose` to monitor activity.

<img src="https://imgur.com/download/3flcbJn" width="618px" title="Proxy json requests to remote resource">

### HTTPS and HTTP2

For HTTPS or HTTP2, pass the `--https` or `--http2` flags respectively. [See the wiki](https://github.com/lwsjs/local-web-server/wiki) for further configuration options and a guide on how to get the "green padlock" in your browser.

```
$ ws --http2
Listening at https://mba4.local:8000, https://127.0.0.1:8000, https://192.168.0.200:8000
```

## Built-in middleware stack

If you do *not* supply a custom middleware stack via the `--stack` option the following default stack will be used. It's designed to cover most typical web development scenarios.

| Name               | Description |
| ------------------ | ---- |
| ↓ [Basic Auth](https://github.com/lwsjs/basic-auth) | Password-protect a server using Basic Authentication |
| ↓ [Body Parser](https://github.com/lwsjs/body-parser) | Parses the request body, making `ctx.request.body` available to downstream middleware.|
| ↓ [Request Monitor](https://github.com/lwsjs/request-monitor) | Feeds traffic information to the `--verbose` output.|
| ↓ [Log](https://github.com/lwsjs/log) | Outputs an access log or stats view to the console.|
| ↓ [Cors](https://github.com/lwsjs/cors) | Support for setting Cross-Origin Resource Sharing (CORS) headers |
| ↓ [Json](https://github.com/lwsjs/json) | Pretty-prints JSON responses. |
| ↓ [Rewrite](https://github.com/lwsjs/rewrite) | URL Rewriting. Use to re-route requests to local or remote destinations.|
| ↓ [Blacklist](https://github.com/lwsjs/blacklist) | Forbid access to sensitive or private resources|
| ↓ [Conditional Get](https://github.com/lwsjs/conditional-get) | Support for HTTP Conditional requests.|
| ↓ [Mime](https://github.com/lwsjs/mime) | Customise the mime-type returned with any static resource.|
| ↓ [Compress](https://github.com/lwsjs/compress) | Compress responses using gzip.|
| ↓ [SPA](https://github.com/lwsjs/spa) | Support for Single Page Applications.|
| ↓ [Static](https://github.com/lwsjs/static) | Serves static files.|
| ↓ [Index](https://github.com/lwsjs/index) | Serves directory listings.|

## Further Documentation

[See the wiki for plenty more documentation and tutorials](https://github.com/lwsjs/local-web-server/wiki).

## Install

```sh
$ npm install -g local-web-server
```

* * *

&copy; 2013-20 Lloyd Brookes \<75pound@gmail.com\>. Documented by [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown).
