[![view on npm](https://badgen.net/npm/v/lws-index)](https://www.npmjs.org/package/lws-index)
[![npm module downloads](https://badgen.net/npm/dt/lws-index)](https://www.npmjs.org/package/lws-index)
[![Gihub repo dependents](https://badgen.net/github/dependents-repo/lwsjs/index)](https://github.com/lwsjs/index/network/dependents?dependent_type=REPOSITORY)
[![Gihub package dependents](https://badgen.net/github/dependents-pkg/lwsjs/index)](https://github.com/lwsjs/index/network/dependents?dependent_type=PACKAGE)
[![Node.js CI](https://github.com/lwsjs/index/actions/workflows/node.js.yml/badge.svg)](https://github.com/lwsjs/index/actions/workflows/node.js.yml)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/feross/standard)

# lws-index

[Lws](https://github.com/lwsjs/lws) middleware plugin to serve directory listings. Wraps [serve-index](https://github.com/expressjs/serve-index), typically used alongside [lws-static](https://github.com/lwsjs/static).

Adds the following options to lws.

```
--index.root path              Index root directory, defaults to the value of --directory or the current directory.
--index.hidden                 Show hidden files.
--index.view name              Display mode, either `tiles` or `details`. Defaults to tiles.
```

* * *

&copy; 2016-22 Lloyd Brookes \<opensource@75lb.com\>.
