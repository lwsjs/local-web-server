#!/usr/bin/env node
'use strict'
const ansi = require('ansi-escape-sequences')
const path = require('path')
const arrayify = require('array-back')
const t = require('typical')
const CommandLineTool = require('command-line-tool')
const MiddlewareStack = require('./middleware-stack')
const debug = require('./debug')

const tool = new CommandLineTool()

class LocalWebServer extends MiddlewareStack {
  getApplication () {
    const Koa = require('koa')
    const app = new Koa()
    app.use(this.compose(this.options))
    return app
  }

  getServer () {
    const options = this.options
    let key = options.key
    let cert = options.cert

    const app = this.getApplication()
    app.on('error', err => {
      if (options['log-format']) {
        console.error(ansi.format(err.message, 'red'))
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

  start () {
    const options = collectOptions(this.getOptionDefinitions())
    this.options = options

    if (options.verbose) {
      debug.setLevel(1)
    }

    if (options.config) {
      tool.stop(JSON.stringify(options, null, '  '), 0)
    } else {
      const server = this.getServer()
      server.listen(options.port, onServerUp.bind(null, options, server.isHttps))
      return server
    }
  }
}

function onServerUp (options, isHttps) {
  const ipList = getIPList(isHttps)
    .map(iface => `[underline]{${isHttps ? 'https' : 'http'}://${iface.address}:${options.port}}`)
    .join(', ')

  console.error(ansi.format(
    path.resolve(options.directory) === process.cwd()
      ? `serving at ${ipList}`
      : `serving [underline]{${options.directory}} at ${ipList}`
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
function collectOptions (mwOptionDefinitions) {
  const loadConfig = require('config-master')
  const stored = loadConfig('local-web-server')
  const cli = require('../lib/cli-data')

  /* parse command line args */
  const definitions = cli.optionDefinitions.concat(arrayify(mwOptionDefinitions))
  let cliOptions = tool.getOptions(definitions, cli.usage(definitions))

  /* override built-in defaults with stored config and then command line options */
  const options = Object.assign({
    port: 8000,
    directory: process.cwd()
  }, stored, cliOptions.server, cliOptions.middleware, cliOptions.misc)

  // console.error(require('util').inspect(options, { depth: 3, colors: true }))

  validateOptions(options)
  return options
}

function validateOptions (options) {
  if (!t.isNumber(options.port)) {
    tool.printError('--port must be numeric')
    console.error(tool.usage)
    tool.halt()
  }
}

module.exports = LocalWebServer
