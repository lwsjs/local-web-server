#!/usr/bin/env node
const nodeVersionMatches = require('node-version-matches')

if (nodeVersionMatches('>=8.0.0')) {
  require('../lib/cli-app').run()
} else {
  console.log('Sorry, this app requires node v8.0.0 or above. Please upgrade https://nodejs.org/en/')
}
