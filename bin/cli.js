#!/usr/bin/env node

//enable proxy
require('global-tunnel-ng').initialize()

const nodeVersionMatches = require('node-version-matches')

if (nodeVersionMatches('>=7.6.0')) {
  require('../lib/cli-app').run()
} else {
  console.log('Sorry, this app requires node v7.6.0 or above. Please upgrade https://nodejs.org/en/')
}
