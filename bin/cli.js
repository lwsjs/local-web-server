#!/usr/bin/env node
const nodeVersionMatches = require('node-version-matches')

if (nodeVersionMatches('>=10')) {
  const WsCli = require('../lib/cli-app')
  const cli = new WsCli()
  cli.start()
} else {
  console.log('Sorry, this app requires node v10.0.0 or above. Please upgrade https://nodejs.org/en/')
}
