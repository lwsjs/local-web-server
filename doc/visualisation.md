## Goaccess
To get live statistics in [goaccess](http://goaccess.io/), first create this config file at `~/.goaccessrc`:

```
time-format %T
date-format %d/%b/%Y
log-format %h %^[%d:%t %^] "%r" %s %b "%R" "%u"
```

Then, start the server, outputting `combined` format logs to disk:

```sh
$ ws -f combined > web.log
```

In a separate tab, point goaccess at `web.log` and it will display statistics in real time:

```
$ goaccess -p ~/.goaccessrc -f web.log
```

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

![local-web-server with logstalgia](https://raw.githubusercontent.com/lwsjs/local-web-server/master/doc/img/logstagia.gif)

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
