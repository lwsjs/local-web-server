[![view on npm](https://badgen.net/npm/v/lws-spa)](https://www.npmjs.org/package/lws-spa)
[![npm module downloads](https://badgen.net/npm/dt/lws-spa)](https://www.npmjs.org/package/lws-spa)
[![Gihub repo dependents](https://badgen.net/github/dependents-repo/lwsjs/spa)](https://github.com/lwsjs/spa/network/dependents?dependent_type=REPOSITORY)
[![Gihub package dependents](https://badgen.net/github/dependents-pkg/lwsjs/spa)](https://github.com/lwsjs/spa/network/dependents?dependent_type=PACKAGE)
[![Node.js CI](https://github.com/lwsjs/spa/actions/workflows/node.js.yml/badge.svg)](https://github.com/lwsjs/spa/actions/workflows/node.js.yml)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/feross/standard)

# lws-spa

[lws](https://github.com/lwsjs/lws) middleware plugin adding support for Single Page Applications. For usage instructions, see [here](https://github.com/lwsjs/local-web-server/wiki/How-to-serve-a-Single-Page-Application-(SPA)).

Adds the following options to lws.

```
--spa, -s file                 Path to a Single Page App, e.g. app.html.
--spa.asset-test RegExp        A regular expression to identify an asset file. Defaults to ".", meaning the
                               server will only read from disk if the requested path contains a ".". This
                               option is more efficient than `spa.asset-test-fs`.
--spa.asset-test-fs            Use the filesystem to identify an asset file. If the file exists on disk,
                               serve it else return the SPA. If specified, `spa.asset-test` will be ignored.
                               This option is less efficient but more reliable than `spa.asset-test`.
```

* * *

&copy; 2016-24 Lloyd Brookes \<opensource@75lb.com\>.

Tested by [test-runner](https://github.com/test-runner-js/test-runner).
