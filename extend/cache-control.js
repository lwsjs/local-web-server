'use strict'
const Cli = require('../')
const cacheControl = require('koa-cache-control')
const cliData = require('../lib/cli-data')

cliData.optionDefinitions.push({ name: 'maxage', group: 'misc' })

const ws = new Cli()
ws.middleware
  .addLogging('dev')
  .add(cacheControl({
    maxAge: 15
  }))
  .addStatic()
  .addIndex()
ws.listen()
