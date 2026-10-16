[![view on npm](https://badgen.net/npm/v/lws-log)](https://www.npmjs.org/package/lws-log)
[![npm module downloads](https://badgen.net/npm/dt/lws-log)](https://www.npmjs.org/package/lws-log)
[![Gihub repo dependents](https://badgen.net/github/dependents-repo/lwsjs/log)](https://github.com/lwsjs/log/network/dependents?dependent_type=REPOSITORY)
[![Gihub package dependents](https://badgen.net/github/dependents-pkg/lwsjs/log)](https://github.com/lwsjs/log/network/dependents?dependent_type=PACKAGE)
[![Node.js CI](https://github.com/lwsjs/log/actions/workflows/node.js.yml/badge.svg)](https://github.com/lwsjs/log/actions/workflows/node.js.yml)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/feross/standard)

# lws-log

Logging middleware for [lws](https://github.com/lwsjs/lws), wrapping [morgan](https://github.com/expressjs/morgan). See [here](https://github.com/lwsjs/local-web-server/wiki/How-to-output-an-access-log) for usage information.

Adds the following options to lws.

```
--log.format, -f string        Possible values: 'stats', 'logstalgia' or anything defined by
                               https://github.com/expressjs/morgan, typically 'dev', 'combined', 'short',
                               'tiny' or a custom format (e.g. ':method -> :url')
```

* * *

&copy; 2016-24 Lloyd Brookes \<opensource@75lb.com\>.
