#!/usr/bin/env node
'use strict'
const path = require('path')
const flatten = require('reduce-flatten')
const arrayify = require('array-back')
const ansi = require('ansi-escape-sequences')

/**
 * @module local-web-server
 */


class CliView {
  constructor (options) {
    this.options = options || {}
  }
  show (key, value) {
    if (key && value) {
      const ansi = require('ansi-escape-sequences')
      const tableLayout = require('table-layout')
      const output = tableLayout({ key: ansi.format(key, 'bold'), value: value}, {
        padding: { left: '', right: ' ' },
        columns: [
          { name: 'key', width: 18 },
          { name: 'value', nowrap: true }
        ]
      })
      process.stderr.write(output)
    } else {
      console.error(key)
    }
  }
  verbose (key, value) {
    if (this.options.verbose) {
      this.show(key, value)
    }
  }
  error (msg) {
    console.error(ansi.format(msg, 'red'))
  }
}

/**
 * @alias module:local-web-server
 * @extends module:middleware-stack
 */
class LocalWebServer {

  /**
   * @param [options] {object} - Server options
   * @param [options.port} {number} - Port
   * @param [options.stack} {string[]|Features[]} - Port
   */
  constructor (initOptions) {
    initOptions = initOptions || {}
    const commandLineArgs = require('command-line-args')
    const commandLineUsage = require('command-line-usage')
    const cli = require('../lib/cli-data')

    this.view = new CliView()

    /* get stored config */
    const loadConfig = require('config-master')
    const stored = loadConfig('local-web-server')

    /* read the config and command-line for feature paths */
    const featurePaths = parseFeaturePaths(initOptions.stack || stored.stack)

    /* load features and build the middleware stack */
    const features = this._buildFeatureStack(featurePaths)

    /* gather feature optionDefinitions and parse the command line */
    const featureOptionDefinitions = features
      .filter(mw => mw.optionDefinitions)
      .map(mw => mw.optionDefinitions())
      .reduce(flatten, [])
      .filter(def => def)
      .map(def => {
        def.group = 'middleware'
        return def
      })

    const usage = commandLineUsage(cli.usage(featureOptionDefinitions))

    let options = {}
    const allOptionDefinitions = cli.optionDefinitions.concat(featureOptionDefinitions)
    if (!initOptions.testMode) {
      try {
        options = commandLineArgs(allOptionDefinitions)
      } catch (err) {
        this.view.error(err.toString())
        if (err.name === 'DUPLICATE_NAME') {
          this.view.error('\nOption Definitions:')
          this.view.error(allOptionDefinitions.map(def => {
            return `name: ${def.name}${def.alias ? ', alias: ' + def.alias : ''}`
          }).join('\n'))
        }
        this.view.show(usage)
        process.exit(1)
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

    this.view.options.verbose = options.verbose

    /**
     * Config
     * @type {object}
     */
    this.options = options

    this.features = features

    features
      .filter(mw => mw.on)
      .forEach(mw => {
        mw.on('verbose', this.view.verbose.bind(this.view))
        mw.on('debug', this.view.verbose.bind(this.view))
      })

    /* --config */
    if (options.config) {
      this.view.show(JSON.stringify(options, null, '  '))
      process.exit(0)

    /* --version */
    } else if (options.version) {
      const pkg = require(path.resolve(__dirname, '..', 'package.json'))
      this.view.show(pkg.version)
      process.exit(0)

    /* --help */
    } else if (options.help) {
      this.view.show(usage)
      process.exit(0)
    }
  }

  getApplication () {
    const Koa = require('koa')
    const app = new Koa()
    const compose = require('koa-compose')
    const convert = require('koa-convert')

    const middlewareStack = this.features
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

    server.listen(options.port)
    if (onListening) server.on('listening', onListening)
    if (!options.testMode) {
      server.on('listening', () => {
        const ipList = getIPList()
          .map(iface => `[underline]{${server.isHttps ? 'https' : 'http'}://${iface.address}:${options.port}}`)
          .join(', ')
        this.view.show('Serving at', ansi.format(ipList))
      })
    }

    return server
  }

  _buildFeatureStack (featurePaths) {
    return featurePaths
      .map(featurePath => loadStack(featurePath))
      .map(Feature => new Feature())
      .map(module => {
        if (module.stack) {
          const featureStack = module.stack()
            .map(Feature => new Feature())
            .map(feature => {
              if (feature.on) {
                feature.on('verbose', this.view.verbose.bind(this.view))
                feature.on('debug', this.view.verbose.bind(this.view))
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

/* manually scan for any --stack passed, as we may need to display stack options */
function parseFeaturePaths (configStack) {
  const featurePaths = arrayify(configStack)
  const featureIndex = process.argv.indexOf('--stack')
  if (featureIndex > -1) {
    for (var i = featureIndex + 1; i < process.argv.length; i++) {
      const featurePath = process.argv[i]
      if (/^-/.test(featurePath)) {
        break
      } else {
        featurePaths.push(featurePath)
      }
    }
  }

  /* if the user did not supply a stack, use the default */
  if (!featurePaths.length) featurePaths.push(path.resolve(__dirname, '..', 'node_modules', 'local-web-server-default-stack'))
  return featurePaths
}

module.exports = LocalWebServer
