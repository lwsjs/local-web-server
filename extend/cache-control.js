'use strict'
const Cli = require('../cli')
const cacheControl = require('koa-cache-control')
const cliData = require('../lib/cli-data')

cliData.push({ name: 'black' })

const ws = new Cli({
  'no-cache': true,
  log: { format: 'dev' }
})

ws.middleware.splice(
  ws.middleware.findIndex(m => m.name === 'mime-type'),
  1,
  {
    name: 'cache-control',
    create: convert(cacheControl({
      maxAge: 15
    }))
  }
)

ws.listen()
