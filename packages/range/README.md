[![view on npm](https://badgen.net/npm/v/lws-range)](https://www.npmjs.org/package/lws-range)
[![npm module downloads](https://badgen.net/npm/dt/lws-range)](https://www.npmjs.org/package/lws-range)
[![Gihub repo dependents](https://badgen.net/github/dependents-repo/lwsjs/range)](https://github.com/lwsjs/range/network/dependents?dependent_type=REPOSITORY)
[![Gihub package dependents](https://badgen.net/github/dependents-pkg/lwsjs/range)](https://github.com/lwsjs/range/network/dependents?dependent_type=PACKAGE)
[![Node.js CI](https://github.com/lwsjs/range/actions/workflows/node.js.yml/badge.svg)](https://github.com/lwsjs/range/actions/workflows/node.js.yml)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/feross/standard)

# lws-range

Lws middleware plugin adding support for [HTTP Range Requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests). Wraps [koa-range](https://github.com/koajs/koa-range).

## Synopsis

Install the plugin then launch a server supporting only range requests and static files.

```
$ npm install --save-dev lws-range

$ ws --stack lws-range lws-static
Listening on http://mbp.local:8000, http://127.0.0.1:8000, http://192.168.0.200:8000
```

Make some requests - note the presence of `Accept-Ranges: bytes` in the response.

```
$ curl http://127.0.0.1:8000/package.json -I
HTTP/1.1 200 OK
Accept-Ranges: bytes
Content-Length: 649
Last-Modified: Sun, 27 Feb 2022 14:26:27 GMT
Cache-Control: max-age=0
Content-Type: application/json; charset=utf-8
Date: Sun, 27 Feb 2022 14:30:21 GMT
```

For more info about `--stack` please read [Using Middleware](https://github.com/lwsjs/local-web-server/wiki/Using-middleware) and the rest of the [wiki](https://github.com/lwsjs/local-web-server/wiki/).

* * *

&copy; 2018-22 Lloyd Brookes \<opensource@75lb.com\>.
