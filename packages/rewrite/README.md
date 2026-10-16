[![view on npm](https://badgen.net/npm/v/lws-rewrite)](https://www.npmjs.org/package/lws-rewrite)
[![npm module downloads](https://badgen.net/npm/dt/lws-rewrite)](https://www.npmjs.org/package/lws-rewrite)
[![Gihub repo dependents](https://badgen.net/github/dependents-repo/lwsjs/rewrite)](https://github.com/lwsjs/rewrite/network/dependents?dependent_type=REPOSITORY)
[![Gihub package dependents](https://badgen.net/github/dependents-pkg/lwsjs/rewrite)](https://github.com/lwsjs/rewrite/network/dependents?dependent_type=PACKAGE)
[![Node.js CI](https://github.com/lwsjs/rewrite/actions/workflows/node.js.yml/badge.svg)](https://github.com/lwsjs/rewrite/actions/workflows/node.js.yml)

# lws-rewrite

[lws](https://github.com/lwsjs/lws) middleware plugin adding URL rewriting support. For usage instructions see [here](https://github.com/lwsjs/local-web-server/wiki/How-to-rewrite-URLs-to-local-or-remote-destinations).

Adds the following options to lws.

```
--rewrite, -r expression ...   A list of URL rewrite rules. For each rule, separate the 'from' and 'to'
                               routes with '->'. Whitespace surrounded the routes is ignored. E.g. '/from ->
                               /to'.
```

* * *

&copy; 2016-26 Lloyd Brookes \<opensource@75lb.com\>.
