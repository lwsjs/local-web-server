#!/usr/bin/env node
'use strict'
const ansi = require('ansi-escape-sequences')
const path = require('path')
const arrayify = require('array-back')
const t = require('typical')
const Tool = require('command-line-tool')
const tool = new Tool()

class Cli {
  constructor (options) {
    this.options = null
    this.app = null
    this.middleware = null

    options = collectOptions()
    this.options = options

    if (options.misc.config) {
      tool.stop(JSON.stringify(options.server, null, '  '), 0)
    } else {
      const Koa = require('koa')
      const app = new Koa()
      this.app = app

      const MiddlewareStack = require('./middleware-stack')
      this.middleware = new MiddlewareStack(options)
      const a = {
        compress: options.server.compress,
        mime: options.server.mime,
        forbid: options.server.forbid,
        spa: options.server.spa,
        'no-cache': options.server['no-cache'],
        rewrite: options.server.rewrite,
        verbose: options.server.verbose,
        mocks: options.server.mocks
      }

      app.on('error', err => {
        if (options.server['log-format']) {
          console.error(ansi.format(err.message, 'red'))
        }
      })
    }
  }

  listen () {
    this.app.use(this.middleware.getMiddleware())
    const options = this.options
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

      const server = https.createServer(serverOptions, this.app.callback())
      server.listen(options.server.port, onServerUp.bind(null, options, true))
    } else {
      this.app.listen(options.server.port, onServerUp.bind(null, options))
    }
  }
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
  const loadConfig = require('config-master')
  const stored = loadConfig('local-web-server')
  const cli = require('../lib/cli-data')

  /* parse command line args */
  let options = tool.getOptions(cli.optionDefinitions, cli.usage)

  const builtIn = {
    port: 8000,
    directory: process.cwd()
  }

  if (options.server.rewrite) {
    options.server.rewrite = parseRewriteRules(options.server.rewrite)
  }

  /* override built-in defaults with stored config and then command line args */
  options.server = Object.assign(builtIn, stored, options.server)

  validateOptions(options)
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

function validateOptions (options) {
  if (!t.isNumber(options.server.port)) {
    tool.printError('--port must be numeric')
    console.error(tool.usage)
    tool.halt()
  }
}

module.exports = Cli
