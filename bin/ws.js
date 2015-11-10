#!/usr/bin/env node
'use strict'
const localWebServer = require('../')
const streamLogStats = require('stream-log-stats')

const options = {
  static: { root: '.' },
  serveIndex: { path: '.' },
  logger: { format: 'common', options: {
    stream: streamLogStats({ refreshRate: 100 })}
  }
}

localWebServer(options)
  .listen(8000, () => {
    console.log(`listening`)
  })
