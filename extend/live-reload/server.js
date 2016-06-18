'use strict'
const Cli = require('../../')
const liveReload = require('koa-livereload')

const ws = new Cli()
ws.addLogging('dev')
  .add({ middleware: liveReload })
  .addStatic()
  .start()
