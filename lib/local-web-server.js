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
    logger: {},
    compress: false
  }, options)

  const app = new Koa()

  if (options.compress) {
    console.log('comp');
    app.use(convert(compress()))
  }
  
  let log = { format: options.logger.format }
  if (options.logger.format) {

    if (log.format === 'none'){
      log.format = undefined
    } else if (log.format === 'logstalgia') {
      /* customised logger :date token, purely to satisfy Logstalgia. */
      morgan.token('date', function () {
        var d = new Date()
        return (d.getDate() + '/' + d.getUTCMonth() + '/' + d.getFullYear() + ':' + d.toTimeString())
          .replace('GMT', '').replace(' (BST)', '')
      })
      log.format = 'combined'
    } else if (log.format) {
      log.stream = process.stdout
    }
  } else {
    log.format = 'common'
    log.stream = streamLogStats({ refreshRate: 100 })
  }
  options.logger.options = options.logger.options || {}
  options.logger.options.stream = log.stream
  if (log.format) app.use(convert(morgan.middleware(log.format, options.logger.options)))

  if (options.static.root) {
    app.use(convert(serve(options.static.root, options.static.options)))
  }
  if (options.serveIndex.path) {
    app.use(convert(serveIndex(options.serveIndex.path, options.serveIndex.options)))
  }

  return app
}
