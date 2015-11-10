'use strict'
const Koa = require('koa')
const serve = require('koa-static')
const convert = require('koa-convert')
const serveIndex = require('koa-serve-index')
const morgan = require('koa-morgan')

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
    logger: {}
  }, options)

  const app = new Koa()

  if (options.logger.format) {
    app.use(convert(morgan.middleware(options.logger.format, options.logger.options)))
  }
  if (options.static.root) {
    app.use(convert(serve(options.static.root, options.static.options)))
  }
  if (options.serveIndex.path) {
    app.use(convert(serveIndex(options.serveIndex.path, options.serveIndex.options)))
  }
  return app
}
