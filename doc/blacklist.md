## Access Control

By default, access to all files is allowed (including dot files). Use `--forbid` to establish a blacklist:
```sh
$ ws --forbid '*.json' '*.yml'
serving at http://localhost:8000
```

[Example](https://github.com/75lb/local-web-server/tree/master/example/forbid).
