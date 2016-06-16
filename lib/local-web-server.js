#!/usr/bin/env node
'use strict'
const ansi = require('ansi-escape-sequences')
const path = require('path')
const arrayify = require('array-back')
const t = require('typical')
const Tool = require('command-line-tool')
const MiddlewareStack = require('./middleware-stack')

const tool = new Tool()

class Cli extends MiddlewareStack {
  start () {
    const options = collectOptions(this.getOptionDefinitions())
    this.options = options

    if (options.misc.verbose) {
      process.env.DEBUG = '*'
    }

    if (options.misc.config) {
      tool.stop(JSON.stringify(options, null, '  '), 0)
    } else {
      const Koa = require('koa')
      const app = new Koa()
      app.on('error', err => {
        if (options.middleware['log-format']) {
          console.error(ansi.format(err.message, 'red'))
        }
      })

      app.use(this.compose(options))

      let key = options.server.key
      let cert = options.server.cert
      if (options.server.https) {
        key = path.resolve(__dirname, '..', 'ssl', '127.0.0.1.key')
        cert = path.resolve(__dirname, '..', 'ssl', '127.0.0.1.crt')
      }

      if (key && cert) {
        const https = require('https')
        const fs = require('fs')

        const serverOptions = {
          key: fs.readFileSync(key),
          cert: fs.readFileSync(cert)
        }

        const server = https.createServer(serverOptions, app.callback())
        server.listen(options.server.port, onServerUp.bind(null, options, true))
      } else {
        app.listen(options.server.port, onServerUp.bind(null, options))
      }
    }
  }
}

function onServerUp (options, isHttps) {
  const ipList = getIPList(isHttps)
    .map(iface => `[underline]{${isHttps ? 'https' : 'http'}://${iface.address}:${options.server.port}}`)
    .join(', ')

  console.error(ansi.format(
    path.resolve(options.middleware.directory) === process.cwd()
      ? `serving at ${ipList}`
      : `serving [underline]{${options.middleware.directory}} at ${ipList}`
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
  let options = tool.getOptions(definitions, cli.usage(definitions))

  /* override built-in defaults with stored config and then command line args */
  options.server = Object.assign({ port: 8000 }, stored.server, options.server)
  options.middleware = Object.assign({ directory: process.cwd() }, stored.middleware || {}, options.middleware)

  if (options.middleware.rewrite) {
    options.middleware.rewrite = parseRewriteRules(options.middleware.rewrite)
  }

  validateOptions(options)
  // console.log(options)
  return options
}

function parseRewriteRules (rules) {
  return rules && rules.map(rule => {
    if (t.isString(rule)) {
      const matches = rule.match(/(\S*)\s*->\s*(\S*)/)
      return {
        from: matches[1],
        to: matches[2]
      }
    } else {
      return rule
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
