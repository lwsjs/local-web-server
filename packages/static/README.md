[![view on npm](https://badgen.net/npm/v/lws-static)](https://www.npmjs.org/package/lws-static)
[![npm module downloads](https://badgen.net/npm/dt/lws-static)](https://www.npmjs.org/package/lws-static)
[![Gihub repo dependents](https://badgen.net/github/dependents-repo/lwsjs/static)](https://github.com/lwsjs/static/network/dependents?dependent_type=REPOSITORY)
[![Gihub package dependents](https://badgen.net/github/dependents-pkg/lwsjs/static)](https://github.com/lwsjs/static/network/dependents?dependent_type=PACKAGE)
[![Node.js CI](https://github.com/lwsjs/static/actions/workflows/node.js.yml/badge.svg)](https://github.com/lwsjs/static/actions/workflows/node.js.yml)

# lws-static

Lws middleware plugin to serve static files, wraps [koa-static](https://github.com/koajs/static). See [here](https://github.com/lwsjs/local-web-server/wiki/How-to-serve-static-files) for usage instrutions.

Adds the following options to `lws`.

<pre><code>
--directory, -d <u>path</u>           Root directory, defaults to the current directory.
--static.maxage <u>number</u>         Cache max-age (in seconds) applied to all resources served.
--static.defer                 If true, serves after `await next`, allowing any downstream middleware to
                               respond first.
--static.index <u>path</u>            Default file name, defaults to `index.html`.
--static.extensions <u>ext</u>        One or more default filename extensions. For example, if you set
                               `--static.extensions html` and request `/page` then the server will look for
                               both `page` and `page.html` on disk, serving the latter.
</pre></code>

* * *

&copy; 2016-26 Lloyd Brookes \<opensource@75lb.com\>.
