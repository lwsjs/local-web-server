## Single Page Application

You're building a web app with client-side routing, so mark `index.html` as the SPA.
```sh
$ ws --spa index.html
```

By default, typical SPA paths (e.g. `/user/1`, `/login`) would return `404 Not Found` as a file does not exist with that path. By marking `index.html` as the SPA you create this rule:

*If a static file at the requested path exists (e.g. `/css/style.css`) then serve it, if it does not (e.g. `/login`) then serve the specified SPA and handle the route client-side.*

[Example](https://github.com/lwsjs/local-web-server/tree/master/example/spa).
