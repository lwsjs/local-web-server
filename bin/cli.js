#!/usr/bin/env node
'use strict'
const LocalWebServer = require('../')
const localWebServer = new LocalWebServer()
try {
  localWebServer.start()
} catch (err) {
  if (err.code === 'MODULE_NOT_FOUND') {
    console.error(err.message)
    console.error(require('util').inspect(err.attempted, { depth: 6, colors: true }))
  } else {
    console.error(err.stack)
  }
}
