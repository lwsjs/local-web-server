#!/usr/bin/env node
'use strict'
const localWebServer = require('../')
const commandLineArgs = require('command-line-args')
const ansi = require('ansi-escape-sequences')
const cliOptions = require('../lib/cli-options')
const loadConfig = require('config-master')
const path = require('path')

const options = {}

/* parse command line args */
const cli = commandLineArgs(cliOptions.definitions)
const usage = cli.getUsage(cliOptions.usageData)

try {
  options.cli = cli.parse()
} catch (err) {
  halt(err.message)
}

options.stored = Object.assign({
  blacklist: []
}, loadConfig('local-web-server'))

options.builtIn = {
  port: 8000,
  directory: process.cwd()
}

/* override built-in defaults with stored config and then command line args */
options.cli.server = Object.assign(options.builtIn, options.stored, options.cli.server)

if (options.cli.misc.help) return console.log(usage)
if (options.cli.misc.config) return console.log(JSON.stringify(options.stored, null, '  '))

localWebServer({
  static: { root: options.cli.server.directory },
  serveIndex: { path: options.cli.server.directory, options: { icons: true } },
  log: { format: options.cli.server['log-format'] },
  compress: options.cli.server.compress,
  mime: options.stored.mime,
  blacklist: options.stored.blacklist.map(regexp => RegExp(regexp, "i"))
}).listen(options.cli.server.port, onServerUp)

function halt (message) {
  console.log(ansi.format(`Error: ${message}`, 'red'))
  console.log(usage)
  process.exit(1)
}

function onServerUp () {
  console.error(ansi.format(
    path.resolve(options.cli.server.directory) === process.cwd()
      ? `serving at [underline]{http://localhost:${options.cli.server.port}}`
      : `serving [underline]{${options.cli.server.directory}} at [underline]{http://localhost:${options.cli.server.port}}`
  ))
}
