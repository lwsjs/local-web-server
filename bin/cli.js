#!/usr/bin/env node
'use strict'
const localWebServer = require('../')
const cliOptions = require('../lib/cli-options')
const commandLineArgs = require('command-line-args')
const ansi = require('ansi-escape-sequences')
const loadConfig = require('config-master')
const path = require('path')
const s = require('string-tools')
const os = require('os')
const arrayify = require('array-back')

const cli = commandLineArgs(cliOptions.definitions)
const usage = cli.getUsage(cliOptions.usageData)
const stored = loadConfig('local-web-server')
const options = collectOptions()

if (options.misc.help) stop(usage, 0)
if (options.misc.config) stop(JSON.stringify(options.server, null, '  '), 0)

const app = localWebServer({
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

app.listen(options.server.port, onServerUp)

function stop (msgs, exitCode) {
  arrayify(msgs).forEach(msg => console.error(ansi.format(msg)))
  process.exit(exitCode)
}

function onServerUp () {
  const ipList = Object.keys(os.networkInterfaces())
    .map(key => os.networkInterfaces()[key])
    .reduce((prev, curr) => prev = prev.concat(curr), [])
    .filter(iface => iface.family === 'IPv4')
    .map(iface => `[underline]{http://${iface.address}:${options.server.port}}`)
    .join(', ')

  console.error(ansi.format(
    path.resolve(options.server.directory) === process.cwd()
      ? `serving at ${ipList}`
      : `serving [underline]{${options.server.directory}} at ${ipList}`
  ))
}

function collectOptions () {
  let options = {}

  /* parse command line args */
  try {
    options = cli.parse()
  } catch (err) {
    stop([ `[red]{Error}: ${err.message}`, usage ], 1)
  }

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
