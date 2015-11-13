'use strict'
const Koa = require('koa')
const serve = require('koa-static')
const convert = require('koa-convert')
const serveIndex = require('koa-serve-index')
const morgan = require('koa-morgan')
const compress = require('koa-compress')
const streamLogStats = require('stream-log-stats')

/**
 * @module local-web-server
 */
module.exports = getApp

process.on('unhandledRejection', (reason, p) => {
  throw reason
})

function getApp (options) {
  options = Object.assign({
    static: {},
    serveIndex: {},
    log: {},
    compress: false
  }, options)


  const log = options.log
  log.options = log.options || {}

  const app = new Koa()

  // app.use((ctx, next) => {
  //   return next().then(() => ctx.type = 'text/plain')
  // })

  if (options.compress) {
    app.use(convert(compress()))
  }

  /* special case log formats */
  if (log.format) {
    if (log.format === 'none'){
      log.format = undefined
    } else if (log.format === 'logstalgia') {
      morgan.token('date', logstalgiaDate)
      log.format = 'combined'
    }
  /* if no specific log format was requested, show log stats */
  } else {
    log.format = 'common'
    log.options.stream = streamLogStats({ refreshRate: 500 })
  }
  if (log.format) app.use(convert(morgan.middleware(log.format, log.options)))

  if (options.static.root) {
    app.use(convert(serve(options.static.root, options.static.options)))
  }
  if (options.serveIndex.path) {
    app.use(convert(serveIndex(options.serveIndex.path, options.serveIndex.options)))
  }

  return app
}

function logstalgiaDate () {
  var d = new Date()
  return (`${d.getDate()}/${d.getUTCMonth()}/${d.getFullYear()}:${d.toTimeString()}`)
    .replace('GMT', '')
    .replace(' (BST)', '')
}
