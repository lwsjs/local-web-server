#!/usr/bin/env node
'use strict'
const ansi = require('ansi-escape-sequences')
const path = require('path')
const arrayify = require('array-back')
const t = require('typical')
const CommandLineTool = require('command-line-tool')
const flatten = require('reduce-flatten')

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

    /* manually scan for any --stack passed, as we may need to display stack options */
    const stackPaths = []
    const stackIndex = process.argv.indexOf('--stack')
    if (stackIndex > -1) {
      for (var i = stackIndex + 1; i < process.argv.length; i++) {
        const stackPath = process.argv[i]
        if (/^-/.test(stackPath)) {
          break
        } else {
          stackPaths.push(stackPath)
        }
      }
    }

    /* load the stack */
    // if (!stackPaths.length) stackPaths.push('local-web-server-default-stack')
    // console.log(stackPaths)
    const stackModules = stackPaths
      .map(stackPath => loadStack(stackPath))
      .map(Middleware => new Middleware())

    /* gather stack option definitions and parse the command line */
    const middlewareOptionDefinitions = stackModules
      .filter(mw => mw.optionDefinitions)
      .map(mw => mw.optionDefinitions())
      .reduce(flatten, [])
      .map(def => {
        def.group = 'middleware'
        return def
      })

    const usage = commandLineUsage(cli.usage(middlewareOptionDefinitions))

    let options = {}
    try {
      options = commandLineArgs(cli.optionDefinitions.concat(middlewareOptionDefinitions))
    } catch (err) {
      console.error(usage)
      tool.halt(err)
    }

    /* combine in stored config */
    const loadConfig = require('config-master')
    const stored = loadConfig('local-web-server')
    options = Object.assign(stored, options.server, options.middleware, options.misc)
    this.options = options

    // console.log(options)

    if (options.verbose) {
      // debug.setLevel(1)
    }

    /* --config */
    if (options.config) {
      tool.stop(JSON.stringify(options, null, '  '), 0)

    /* --version */
    } else if (options.version) {
      const pkg = require(path.resolve(__dirname, '..', 'package.json'))
      tool.stop(pkg.version)

    /* --help */
    } else if (options.help) {
      tool.stop(usage)
    } else {
      const compose = require('koa-compose')
      const convert = require('koa-convert')
      const middlewareStack = stackModules
        .filter(mw => mw.middleware)
        .map(mw => mw.middleware)
        .map(middleware => middleware(options))
        .filter(middleware => middleware)
        .reduce(flatten, [])
        .map(convert)
      this.stack = compose(middlewareStack)
    }
  }

  getApplication (options) {
    const Koa = require('koa')
    const app = new Koa()
    app.use(this.stack)
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

/**
 * Loads a module by either path or name.
 * @returns {object}
 */
function loadStack (modulePath) {
  let module
  if (modulePath) {
    const fs = require('fs')
    try {
      module = require(path.resolve(modulePath))
    } catch (err) {
      const walkBack = require('walk-back')
      const foundPath = walkBack(process.cwd(), path.join('node_modules', 'local-web-server-' + modulePath))
      if (foundPath) {
        module = require(foundPath)
      } else {
        const foundPath2 = walkBack(process.cwd(), path.join('node_modules', modulePath))
        if (foundPath2) {
          module = require(foundPath2)
        }
      }
    }
  }
  if (!module.prototype.middleware) {
    tool.halt(new Error('Must supply a Middleware'))
  }
  return module
}

module.exports = LocalWebServer
