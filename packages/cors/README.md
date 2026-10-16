[![view on npm](https://badgen.net/npm/v/lws-cors)](https://www.npmjs.org/package/lws-cors)
[![npm module downloads](https://badgen.net/npm/dt/lws-cors)](https://www.npmjs.org/package/lws-cors)
[![Gihub repo dependents](https://badgen.net/github/dependents-repo/lwsjs/cors)](https://github.com/lwsjs/cors/network/dependents?dependent_type=REPOSITORY)
[![Gihub package dependents](https://badgen.net/github/dependents-pkg/lwsjs/cors)](https://github.com/lwsjs/cors/network/dependents?dependent_type=PACKAGE)
[![Node.js CI](https://github.com/lwsjs/cors/actions/workflows/node.js.yml/badge.svg)](https://github.com/lwsjs/cors/actions/workflows/node.js.yml)

# lws-cors

Support for setting Cross-Origin Resource Sharing (CORS) headers to lws. Wraps [@koajs/cors](https://github.com/koajs/cors). For usage instructions, see [here](https://github.com/lwsjs/local-web-server/wiki/How-to-configure-Cross-Origin-Resource-Sharing-(CORS)).

Adds the following options to lws.

```
--cors.origin string             Set a `Access-Control-Allow-Origin` value. Default is the request Origin
                                 header.
--cors.allow-methods string      Set a `Access-Control-Allow-Methods` value. Default is
                                 "GET,HEAD,PUT,POST,DELETE,PATCH"
--cors.credentials               Set this flag to add `Access-Control-Allow-Credentials` header.
--cors.opener-policy string      Set a value for the `Cross-Origin-Opener-Policy` header (specify `unsafe-
                                 none`, same-origin-allow-popups` or `same-origin`).
--cors.embedder-policy string    Set a value for the `Cross-Origin-Embedder-Policy` header (specify `unsafe-
                                 none` or `require-corp`).
--cors.private-network-access    Set this flag to enable `Access-Control-Request-Private-Network` support.
```

* * *

&copy; 2016-26 Lloyd Brookes \<opensource@75lb.com\>.
