## URL rewriting

Your application requested `/css/style.css` but it's stored at `/build/css/style.css`. To avoid a 404 you need a rewrite rule:

```sh
$ ws --rewrite '/css/style.css -> /build/css/style.css'
```

Or, more generally (matching any stylesheet under `/css`):

```sh
$ ws --rewrite '/css/:stylesheet -> /build/css/:stylesheet'
```

With a deep CSS directory structure it may be easier to mount the entire contents of `/build/css` to the `/css` path:

```sh
$ ws --rewrite '/css/* -> /build/css/$1'
```

this rewrites `/css/a` as `/build/css/a`, `/css/a/b/c` as `/build/css/a/b/c` etc.

### Proxied requests

If the `to` URL contains a remote host, local-web-server will act as a proxy - fetching and responding with the remote resource.

Mount the npm registry locally:
```sh
$ ws --rewrite '/npm/* -> http://registry.npmjs.org/$1'
```

Map local requests for repo data to the Github API:
```sh
$ ws --rewrite '/:user/repos/:name -> https://api.github.com/repos/:user/:name'
```

[Example](https://github.com/75lb/local-web-server/tree/master/example/rewrite).
