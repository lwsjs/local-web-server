## Goaccess

## Logstalgia
local-web-server is compatible with [logstalgia](http://code.google.com/p/logstalgia/).

### Install Logstalgia
On MacOSX, install with [homebrew](http://brew.sh):
```sh
$ brew install logstalgia
```

Alternatively, [download a release for your system from github](https://github.com/acaudwell/Logstalgia/releases/latest).

Then pipe the `logstalgia` output format directly into logstalgia for real-time visualisation:
```sh
$ ws -f logstalgia | logstalgia -
```

![local-web-server with logstalgia](https://raw.githubusercontent.com/75lb/local-web-server/master/doc/img/logstagia.gif)

## glTail
To use with [glTail](http://www.fudgie.org), write your log to disk using the "default" format:
```sh
$ ws -f default > web.log
```

Then specify this file in your glTail config:

```yaml
servers:
    dev:
        host: localhost
        source: local
        files: /Users/Lloyd/Documents/MySite/web.log
        parser: apache
        color: 0.2, 0.2, 1.0, 1.0
```
