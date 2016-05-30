#!/usr/bin/env node
'use strict'
const cli = require('../lib/cli-data')
const commandLineUsage = require('command-line-usage')
const ansi = require('ansi-escape-sequences')
const path = require('path')
const arrayify = require('array-back')
const t = require('typical')

function ws () {
  const usage = commandLineUsage(cli.usageData)

  let options

  try {
    options = collectOptions()
  } catch (err) {
    stop([ `[red]{Error}: ${err.message}`, usage ], 1)
    return
  }

  if (options.misc.help) {
    stop(usage, 0)
  } else if (options.misc.config) {
    stop(JSON.stringify(options.server, null, '  '), 0)
  } else {
    const localWebServer = require('../')
    const Koa = require('koa')

    const valid = validateOptions(options, usage)
    if (!valid) return

    const app = new Koa()

    app.on('error', err => {
      if (options.server['log-format']) {
        console.error(ansi.format(err.message, 'red'))
      }
    })

    const ws = localWebServer({
      static: {
        root: options.server.directory,
        options: {
          hidden: true
        }
      },
      serveIndex: {
        path: options.server.directory,
        options: {
          icons: true,
          hidden: true
        }
      },
      log: {
        format: options.server['log-format']
      },
      compress: options.server.compress,
      mime: options.server.mime,
      forbid: options.server.forbid,
      spa: options.server.spa,
      'no-cache': options.server['no-cache'],
      rewrite: options.server.rewrite,
      verbose: options.server.verbose,
      mocks: options.server.mocks
    })

    app.use(ws)

    if (options.server.https) {
      options.server.key = path.resolve(__dirname, '..', 'ssl', '127.0.0.1.key')
      options.server.cert = path.resolve(__dirname, '..', 'ssl', '127.0.0.1.crt')
    }

    if (options.server.key && options.server.cert) {
      const https = require('https')
      const fs = require('fs')

      const serverOptions = {
        key: fs.readFileSync(options.server.key),
        cert: fs.readFileSync(options.server.cert)
      }

      const server = https.createServer(serverOptions, app.callback())
      server.listen(options.server.port, onServerUp.bind(null, options, true))
    } else {
      app.listen(options.server.port, onServerUp.bind(null, options))
    }
  }
}

function stop (msgs, exitCode) {
  arrayify(msgs).forEach(msg => console.error(ansi.format(msg)))
  process.exitCode = exitCode
}

function onServerUp (options, isHttps) {
  const ipList = getIPList(isHttps)
    .map(iface => `[underline]{${isHttps ? 'https' : 'http'}://${iface.address}:${options.server.port}}`)
    .join(', ')

  console.error(ansi.format(
    path.resolve(options.server.directory) === process.cwd()
      ? `serving at ${ipList}`
      : `serving [underline]{${options.server.directory}} at ${ipList}`
  ))
}

function getIPList (isHttps) {
  const flatten = require('reduce-flatten')
  const os = require('os')

  let ipList = Object.keys(os.networkInterfaces())
    .map(key => os.networkInterfaces()[key])
    .reduce(flatten, [])
    .filter(iface => iface.family === 'IPv4')
  ipList.unshift({ address: os.hostname() })
  return ipList
}

/**
 * Return default, stored and command-line options combined
 */
function collectOptions () {
  const commandLineArgs = require('command-line-args')
  const loadConfig = require('config-master')
  const stored = loadConfig('local-web-server')

  /* parse command line args */
  let options = commandLineArgs(cli.definitions)

  const builtIn = {
    port: 8000,
    directory: process.cwd(),
    forbid: [],
    rewrite: []
  }

  if (options.server.rewrite) {
    options.server.rewrite = parseRewriteRules(options.server.rewrite)
  }

  /* override built-in defaults with stored config and then command line args */
  options.server = Object.assign(builtIn, stored, options.server)
  return options
}

function parseRewriteRules (rules) {
  return rules && rules.map(rule => {
    const matches = rule.match(/(\S*)\s*->\s*(\S*)/)
    return {
      from: matches[1],
      to: matches[2]
    }
  })
}

function validateOptions (options, usage) {
  let valid = true
  function invalid (msg) {
    return `[red underline]{Invalid:} [bold]{${msg}}`
  }

  if (!t.isNumber(options.server.port)) {
    stop([ invalid(`--port must be numeric`), usage ], 1)
    valid = false
  }
  return valid
}

ws()
