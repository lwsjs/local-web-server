#!/usr/bin/env node
const nodeVersionMatches = require('node-version-matches')

if (nodeVersionMatches('>=8')) {
  const WsCli = require('../lib/cli-app')
  const cli = new WsCli()
  try {
    cli.start()
  } catch (err) {
    console.error(require('util').inspect(err, { depth: 6, colors: true }))
    process.exitCode = 1
  }
} else {
  console.log('Sorry, this app requires node v8.0.0 or above. Please upgrade https://nodejs.org/en/')
}
