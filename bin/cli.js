#!/usr/bin/env node
function validNodeVersion () {
  var valid = false
  try {
    const semver = require('semver')
    valid = semver.gte(require('process').version, '7.6.0')
  } catch (err) {}
  return valid
}

if (validNodeVersion()) {
  require('../lib/cli-app').run()
} else {
  console.log('Sorry, this app requires node v7.6.0 or above. Please upgrade https://nodejs.org/en/')
}
