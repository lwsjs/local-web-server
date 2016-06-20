# Logging
By default, local-web-server outputs a simple, dynamic statistics view. To see traditional web server logs, use `--log-format`:

```sh
$ ws --log-format combined
serving at http://localhost:8000
::1 - - [16/Nov/2015:11:16:52 +0000] "GET / HTTP/1.1" 200 12290 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2562.0 Safari/537.36"
```

The format value supplied is passed directly to [morgan](https://github.com/expressjs/morgan). The exception is `--log-format none` which disables all output.

# Visualisation

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
