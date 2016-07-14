#!/usr/bin/env node
'use strict'
const path = require('path')
const CommandLineTool = require('command-line-tool')
const flatten = require('reduce-flatten')
const arrayify = require('array-back')
const ansi = require('ansi-escape-sequences')

/**
 * @module local-web-server
 */

const tool = new CommandLineTool()

/**
 * @alias module:local-web-server
 * @extends module:middleware-stack
 */
class LocalWebServer {
  constructor (initOptions) {
    initOptions = initOptions || {}
    const commandLineArgs = require('command-line-args')
    const commandLineUsage = require('command-line-usage')
    const cli = require('../lib/cli-data')
    const loadConfig = require('config-master')

    const stored = loadConfig('local-web-server')

    /* manually scan for any --stack passed, as we may need to display stack options */
    const stackPaths = arrayify(initOptions.stack || stored.stack) || []
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

    /* if the user did not supply a stack, use the default */
    if (!stackPaths.length) stackPaths.push(path.resolve(__dirname, '..', 'node_modules', 'local-web-server-default-stack'))

    /* build the stack */
    const stackModules = buildStack(stackPaths, this.onVerbose.bind(this), this.onDebug.bind(this))

    /* gather stack option definitions and parse the command line */
    const middlewareOptionDefinitions = stackModules
      .filter(mw => mw.optionDefinitions)
      .map(mw => mw.optionDefinitions())
      .reduce(flatten, [])
      .filter(def => def)
      .map(def => {
        def.group = 'middleware'
        return def
      })

    const usage = commandLineUsage(cli.usage(middlewareOptionDefinitions))

    let options = {}
    const allOptionDefinitions = cli.optionDefinitions.concat(middlewareOptionDefinitions)
    if (!initOptions.ignoreCli) {
      try {
        options = commandLineArgs(allOptionDefinitions)
      } catch (err) {
        tool.printError(err)
        tool.printError(allOptionDefinitions.map(def => {
          return `name: ${def.name}${def.alias ? ', alias: ' + def.alias : ''}`
        }).join('\n'))
        console.error(usage)
        tool.halt()
      }
    }

    /* combine in stored config */
    options = Object.assign(
      { port: 8000 },
      initOptions,
      stored,
      options.server,
      options.middleware,
      options.misc
    )

    /**
     * Config
     * @type {object}
     */
    this.options = options

    if (options.verbose) {
      stackModules
        .filter(mw => mw.on)
        .forEach(mw => mw.on('verbose', onVerbose))
    }
    if (options.debug) {
      stackModules
        .filter(mw => mw.on)
        .forEach(mw => mw.on('debug', onDebug))
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
      this.stack = stackModules
    }
  }

  getApplication () {
    const Koa = require('koa')
    const app = new Koa()
    const compose = require('koa-compose')
    const convert = require('koa-convert')

    const middlewareStack = this.stack
      .filter(mw => mw.middleware)
      .map(mw => mw.middleware(this.options))
      .reduce(flatten, [])
      .filter(mw => mw)
      .map(convert)

    app.use(compose(middlewareStack))
    app.on('error', err => {
      console.error(ansi.format(err.stack, 'red'))
    })
    return app
  }

  getServer (onListening) {
    const app = this.getApplication()
    const options = this.options

    let key = options.key
    let cert = options.cert

    if (options.https && !(key && cert)) {
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

    const tableLayout = require('table-layout')

    server.listen(options.port, function () {
      const ipList = getIPList()
        .map(iface => `[underline]{${server.isHttps ? 'https' : 'http'}://${iface.address}:${options.port}}`)
        .join(', ')
      console.error(ansi.format('Serving at', 'bold'), ansi.format(ipList))
    })
    return server
  }

  onVerbose (title, msg) {
    if (this.options.verbose) {
      console.error(ansi.format(title, 'bold'), msg)
    }
  }
  onDebug (title, msg) {
    if (this.options.debug) {
      console.error(ansi.format(title, 'bold'), msg)
    }
  }
}

/**
 * Loads a module by either path or name.
 * @returns {object}
 */
function loadStack (modulePath) {
  let module
  if (isModule(modulePath)) return modulePath
  const tried = []
  if (modulePath) {
    try {
      tried.push(path.resolve(modulePath))
      module = require(path.resolve(modulePath))
    } catch (err) {
      const walkBack = require('walk-back')
      const foundPath = walkBack(process.cwd(), path.join('node_modules', 'local-web-server-' + modulePath))
      tried.push('local-web-server-' + modulePath)
      if (foundPath) {
        module = require(foundPath)
      } else {
        const foundPath2 = walkBack(process.cwd(), path.join('node_modules', modulePath))
        tried.push(modulePath)
        if (foundPath2) {
          module = require(foundPath2)
        }
      }
    }
  }
  if (module) {
    if (!isModule(module)) {
      const insp = require('util').inspect(module, { depth: 3, colors: true })
      const msg = `Not valid Middleware at: ${insp}`
      tool.halt(new Error(msg))
    }
  } else {
    const msg = `No module found at: \n${tried.join('\n')}`
    tool.halt(new Error(msg))
  }
  return module
}

function isModule (module) {
  return module.prototype && (module.prototype.middleware || module.prototype.stack)
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

function buildStack (stackPaths, onVerbose, onDebug) {
  return stackPaths
    .map(stackPath => loadStack(stackPath))
    .map(Middleware => new Middleware())
    .map(module => {
      if (module.stack) {
        const featureStack = module.stack()
          .map(Feature => new Feature())
          .map(feature => {
            if (feature.on) {
              feature.on('verbose', onVerbose)
              feature.on('debug', onDebug)
            }
            return feature
          })

        module.optionDefinitions = function () {
          return featureStack
            .map(feature => feature.optionDefinitions && feature.optionDefinitions())
            .filter(definitions => definitions)
            .reduce(flatten, [])
        }
        module.middleware = function (options) {
          return featureStack
            .map(feature => feature.middleware(options))
            .reduce(flatten, [])
            .filter(mw => mw)
        }
      }
      return module
    })
}

module.exports = LocalWebServer
