#!/usr/bin/env node
'use strict'
const localWebServer = require('../')
const cliOptions = require('../lib/cli-options')
const commandLineArgs = require('command-line-args')
const ansi = require('ansi-escape-sequences')
const loadConfig = require('config-master')
const path = require('path')

const cli = commandLineArgs(cliOptions.definitions)
const usage = cli.getUsage(cliOptions.usageData)
const stored = loadConfig('local-web-server')
const options = collectOptions()

// TODO summary line on server launch

if (options.misc.help) {
  console.log(usage)
  process.exit(0)
}
if (options.misc.config) {
  console.log(JSON.stringify(options.server, null, '  '))
  process.exit(0)
}

localWebServer({
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
  rewrite: options.server.rewrite
}).listen(options.server.port, onServerUp)

function halt (err) {
  console.log(ansi.format(`Error: ${err.message}`, 'red'))
  console.log(usage)
  process.exit(1)
}

function onServerUp () {
  console.error(ansi.format(
    path.resolve(options.server.directory) === process.cwd()
      ? `serving at [underline]{http://localhost:${options.server.port}}`
      : `serving [underline]{${options.server.directory}} at [underline]{http://localhost:${options.server.port}}`
  ))
}

function collectOptions () {
  let options = {}

  /* parse command line args */
  try {
    options = cli.parse()
  } catch (err) {
    halt(err)
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
