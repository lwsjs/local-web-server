## Stored config

Use the same options every time? Persist then to `package.json`:
```json
{
  "name": "example",
  "version": "1.0.0",
  "local-web-server": {
    "port": 8100,
    "forbid": "*.json"
  }
}
```

or `.local-web-server.json`
```json
{
  "port": 8100,
  "forbid": "*.json"
}
```

local-web-server will merge and use all config found, searching from the current directory upward. In the case both `package.json` and `.local-web-server.json` config is found in the same directory, `.local-web-server.json` will take precedence. Options set on the command line take precedence over all.

To inspect stored config, run:
```sh
$ ws --config
```