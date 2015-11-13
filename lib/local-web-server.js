'use strict'
const path = require('path')
const Koa = require('koa')
const serve = require('koa-static')
const convert = require('koa-convert')
const serveIndex = require('koa-serve-index')
const morgan = require('koa-morgan')
const compress = require('koa-compress')
const streamLogStats = require('stream-log-stats')
const cors = require('kcors')

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

  /* CORS: allow from any origin */
  app.use(convert(cors()))

  if (options.mime) {
    app.use((ctx, next) => {
      return next().then(() => {
        const reqPathExtension = path.extname(ctx.path).slice(1)
        Object.keys(options.mime).forEach(mimeType => {
          const extsToOverride = options.mime[mimeType]
          if (extsToOverride.indexOf(reqPathExtension) > -1) ctx.type = mimeType
        })
      })
    })
  }

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
