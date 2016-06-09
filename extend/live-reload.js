'use strict'
const Cli = require('../')
const liveReload = require('koa-livereload')

const ws = new Cli()
ws.middleware
  .addLogging('dev')
  .add(liveReload())
  .addStatic()
ws.listen(8000)
