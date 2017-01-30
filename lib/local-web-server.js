#!/usr/bin/env node
'use strict'

const path = require('path')
const flatten = require('reduce-flatten')
const arrayify = require('array-back')
const ansi = require('ansi-escape-sequences')

/**
 * @module local-web-server
 */

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
    const commandLineUsage = require('command-line-usage')
    const CliView = require('./cli-view')
    const cli = require('../lib/cli-data')

    /* get stored config */
    const loadConfig = require('config-master')
    const stored = loadConfig('local-web-server')

    /* read the config and command-line for feature paths */
    const featurePaths = parseFeaturePaths(initOptions.stack || stored.stack)

    /**
     * Loaded feature modules
     * @type {Feature[]}
     */
    this.features = this._buildFeatureStack(featurePaths)

    /* gather feature optionDefinitions and parse the command line */
    const featureOptionDefinitions = gatherOptionDefinitions(this.features)
    const usage = commandLineUsage(cli.usage(featureOptionDefinitions))
    const allOptionDefinitions = cli.optionDefinitions.concat(featureOptionDefinitions)
    let options = initOptions.testMode ? {} : parseCommandLineOptions(allOptionDefinitions, this.view)

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

    /**
     * Current view.
     * @type {View}
     */
    this.view = null

    /* --config */
    if (options.config) {
      console.error(JSON.stringify(options, null, '  '))
      process.exit(0)

    /* --version */
    } else if (options.version) {
      const pkg = require(path.resolve(__dirname, '..', 'package.json'))
      console.error(pkg.version)
      process.exit(0)

    /* --help */
    } else if (options.help) {
      console.error(usage)
      process.exit(0)

    } else {
      /**
       * Node.js server
       * @type {Server}
       */
      this.server = this.getServer()

      if (options.view) {
        const View = loadModule(options.view)
        this.view = new View(this)
      } else {
        this.view = new CliView(this)
      }

      for (const feature of this.features) {
        if (feature.ready) {
          feature.ready(this)
        }
      }
    }
  }

  /**
   * Returns a middleware application suitable for passing to `http.createServer`. The application is a function with three args (req, res and next) which can be created by express, Koa or hand-rolled.
   * @returns {function}
   */
  getApplication () {
    const Koa = require('koa')
    const app = new Koa()
    const compose = require('koa-compose')
    const convert = require('koa-convert')

    const middlewareStack = this.features
      .filter(mw => mw.middleware)
      .map(mw => mw.middleware(this.options, this))
      .reduce(flatten, [])
      .filter(mw => mw)
      .map(convert)

    app.use(compose(middlewareStack))
    app.on('error', err => {
      console.error(ansi.format(err.stack, 'red'))
    })
    return app.callback()
  }

  /**
   * Returns a listening server which processes requests using the middleware supplied.
   * @returns {Server}
   */
  getServer () {
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
      server = https.createServer(serverOptions, app)
      server.isHttps = true
    } else {
      const http = require('http')
      server = http.createServer(app)
    }

    server.listen(options.port)
    // if (onListening) server.on('listening', onListening)

    /* on server-up message */
    if (!options.testMode) {
      server.on('listening', () => {
        const ipList = getIPList()
          .map(iface => `[underline]{${server.isHttps ? 'https' : 'http'}://${iface.address}:${options.port}}`)
          .join(', ')
        console.error('Serving at', ansi.format(ipList))
      })
    }

    return server
  }

  /**
   * Returns an array of Feature instances, given their module paths/names.
   * @return {feature[]}
   */
  _buildFeatureStack (featurePaths) {
    const FeatureBase = require('./feature')
    return featurePaths
      .map(featurePath => loadFeature(featurePath))
      .map(Feature => new Feature(this))
      .map(feature => FeatureBase.prototype.expandStack.call(feature))
  }
}

/**
 * Load a module and verify it's of the correct type
 * @returns {Feature}
 */
function loadFeature (modulePath) {
  const isModule = module => module.prototype && (module.prototype.middleware || module.prototype.stack || module.prototype.ready)
  if (isModule(modulePath)) return modulePath
  const module = loadModule(modulePath)
  if (module) {
    if (!isModule(module)) {
      const insp = require('util').inspect(module, { depth: 3, colors: true })
      const msg = `Not valid Middleware at: ${insp}`
      console.error(msg)
      process.exit(1)
    }
  } else {
    const msg = `No module found for: ${modulePath}`
    console.error(msg)
    process.exit(1)
  }
  return module
}

/**
 * Returns a module, loaded by the first to succeed from
 * - direct path
 * - 'node_modules/local-web-server-' + path, from current folder upward
 * - 'node_modules/' + path, from current folder upward
 * - also search local-web-server project node_modules? (e.g. to search for a feature module without need installing it locally)
 * @returns {object}
 */
function loadModule (modulePath) {
  let module
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
        } else {
          const foundPath3 = walkBack(path.resolve(__filename, '..'), path.join('node_modules', 'local-web-server-' + modulePath))
          if (foundPath3) {
            return require(foundPath3)
          } else {
            const foundPath4 = walkBack(path.resolve(__filename, '..'), path.join('node_modules', modulePath))
            if (foundPath4) {
              return require(foundPath4)
            }
          }
        }
      }
    }
  }
  return module
}

/**
 * Returns an array of available IPv4 network interfaces
 * @example
 * [ { address: 'mbp.local' },
 *  { address: '127.0.0.1',
 *    netmask: '255.0.0.0',
 *    family: 'IPv4',
 *    mac: '00:00:00:00:00:00',
 *    internal: true },
 *  { address: '192.168.1.86',
 *    netmask: '255.255.255.0',
 *    family: 'IPv4',
 *    mac: 'd0:a6:37:e9:86:49',
 *    internal: false } ]
 */
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

function gatherOptionDefinitions (features) {
  return features
    .filter(mw => mw.optionDefinitions)
    .map(mw => mw.optionDefinitions())
    .reduce(flatten, [])
    .filter(def => def)
    .map(def => {
      def.group = 'middleware'
      return def
    })
}

function parseCommandLineOptions (allOptionDefinitions) {
  const commandLineArgs = require('command-line-args')
  try {
    return commandLineArgs(allOptionDefinitions)
  } catch (err) {
    console.error(err)

    /* handle duplicate option names */
    if (err.name === 'DUPLICATE_NAME') {
      console.error('\nOption Definitions:')
      console.error(allOptionDefinitions.map(def => {
        return `name: ${def.name}${def.alias ? ', alias: ' + def.alias : ''}`
      }).join('\n'))
    }
    console.error(usage)
    process.exit(1)
  }
}

module.exports = LocalWebServer
