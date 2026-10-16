[![view on npm](https://badgen.net/npm/v/lws-blacklist)](https://www.npmjs.org/package/lws-blacklist)
[![npm module downloads](https://badgen.net/npm/dt/lws-blacklist)](https://www.npmjs.org/package/lws-blacklist)
[![Gihub repo dependents](https://badgen.net/github/dependents-repo/lwsjs/blacklist)](https://github.com/lwsjs/blacklist/network/dependents?dependent_type=REPOSITORY)
[![Gihub package dependents](https://badgen.net/github/dependents-pkg/lwsjs/blacklist)](https://github.com/lwsjs/blacklist/network/dependents?dependent_type=PACKAGE)
[![Node.js CI](https://github.com/lwsjs/blacklist/actions/workflows/node.js.yml/badge.svg)](https://github.com/lwsjs/blacklist/actions/workflows/node.js.yml)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/feross/standard)

# lws-blacklist

Middleware for [lws](https://github.com/lwsjs/lws) enabling certain routes to be forbidden. See [here](https://github.com/lwsjs/local-web-server/wiki/How-to-blacklist-certain-routes) for usage instructions.

Adds the following options to lws.

```
--blacklist path ...           A list of routes to forbid, e.g. `--blacklist "/admin/(.*)" "(.*).php"`
```

* * *

&copy; 2016-26 Lloyd Brookes \<opensource@75lb.com\>.
