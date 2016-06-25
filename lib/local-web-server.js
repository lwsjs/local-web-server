#!/usr/bin/env node
'use strict'
const ansi = require('ansi-escape-sequences')
const path = require('path')
const arrayify = require('array-back')
const t = require('typical')
const CommandLineTool = require('command-line-tool')

/**
 * @module local-web-server
 */

const tool = new CommandLineTool()

/**
 * @alias module:local-web-server
 * @extends module:middleware-stack
 */
class LocalWebServer {
  constructor (stack) {
    const commandLineArgs = require('command-line-args')
    const commandLineUsage = require('command-line-usage')
    const cli = require('../lib/cli-data')

    let stackPath
    const stackIndex = process.argv.indexOf('--stack')
    if (stackIndex > -1) {
      stackPath = process.argv[stackIndex + 1]
      if (/^-/.test(stackPath)) stackPath = null
    }

    const stackModule = loadStack(stackPath) || require('local-web-server-default-stack')
    this.stack = new stackModule()
    this.stack.addAll()
    const middlewareOptionDefinitions = this.stack.getOptionDefinitions()
    // console.log(middlewareOptionDefinitions)
    const usage = commandLineUsage(cli.usage(middlewareOptionDefinitions))

    let options = {}
    try {
      options = commandLineArgs(cli.optionDefinitions.concat(middlewareOptionDefinitions))
    } catch (err) {
      console.error(usage)
      tool.halt(err)
    }

    const loadConfig = require('config-master')
    const stored = loadConfig('local-web-server')
    /* override stored config with command line options */
    options = Object.assign(stored, options.server, options.middleware, options.misc)
    this.options = options

    if (options.verbose) {
      // debug.setLevel(1)
    }
    if (options.config) {
      tool.stop(JSON.stringify(options, null, '  '), 0)
    } else if (options.version) {
      const pkg = require(path.resolve(__dirname, '..', 'package.json'))
      tool.stop(pkg.version)
    } else {
      if (this.options.help) {
        tool.stop(usage)
      }
    }
  }

  getApplication (options) {
    const Koa = require('koa')
    const app = new Koa()
    app.use(this.stack.compose(this.options))
    return app
  }

  getServer (options) {
    const app = this.getApplication(options)
    options = this.options
    let key = options.key
    let cert = options.cert

    app.on('error', err => {
      if (options['log-format']) {
        console.error(ansi.format(err.stack, 'red'))
      }
    })

    if (options.https) {
      key = path.resolve(__dirname, '..', 'ssl', '127.0.0.1.key')
      cert = path.resolve(__dirname, '..', 'ssl', '127.0.0.1.crt')
    }

    let server = null
    if (key && cert) {
      const fs = require('fs')
      const serverOptions = {
        key: fs.readFileSync(key),
        cert: fs.readFileSync(cert)
      }

      const https = require('https')
      server = https.createServer(serverOptions, app.callback())
      server.isHttps = true
    } else {
      const http = require('http')
      server = http.createServer(app.callback())
    }
    return server
  }

  listen (options, callback) {
    options = this.options
    const server = this.getServer()
    const port = options.port || 8000
    server.listen(port, () => {
      onServerUp(port, options.directory, server.isHttps)
      if (callback) callback()
    })
    return server
  }
}

function onServerUp (port, directory, isHttps) {
  const ipList = getIPList()
    .map(iface => `[underline]{${isHttps ? 'https' : 'http'}://${iface.address}:${port}}`)
    .join(', ')

  console.error(ansi.format(
    path.resolve(directory || '') === process.cwd()
      ? `serving at ${ipList}`
      : `serving [underline]{${directory}} at ${ipList}`
  ))
}


function getIPList () {
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
function collectUserOptions (mwOptionDefinitions) {
  const loadConfig = require('config-master')
  const stored = loadConfig('local-web-server')
  const cli = require('../lib/cli-data')

  /* parse command line args */
  const definitions = mwOptionDefinitions
    ? cli.optionDefinitions.concat(arrayify(mwOptionDefinitions))
    : cli.optionDefinitions
  let cliOptions = tool.getOptions(definitions, cli.usage(definitions))

  /* override stored config with command line options */
  const options = Object.assign(stored, cliOptions.server, cliOptions.middleware, cliOptions.misc)
  return options
}

function loadStack (modulePath) {
  let module
  if (modulePath) {
    const fs = require('fs')
    try {
      module = require(path.resolve(modulePath))
      if (!module.prototype.addAll) {
        tool.halt(new Error('Must supply a MiddlewareStack'))
      }
    } catch (err) {
      const walkBack = require('walk-back')
      const foundPath = walkBack(path.resolve(process.cwd(), 'node_modules'), modulePath)
      if (foundPath) {
        module = require(foundPath)
      }
    }
  }
  return module
}

module.exports = LocalWebServer
