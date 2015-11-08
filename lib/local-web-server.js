'use strict'
const Koa = require('koa')
const serve = require('koa-static')
const convert = require('koa-convert')
const extend = require('deep-extend')
const serveIndex = require('koa-serve-index')

/**
 * @module local-web-server
 */
module.exports = getApp

process.on('unhandledRejection', (reason, p) => {
  throw reason
})

function getApp (options) {
  options = extend({
    static: { root: '.' },
    serveIndex: { path: '.' }
  }, options)

  const app = new Koa()

  app.use(convert(serve(options.static.root, options.static.options)))
  app.use(convert(serveIndex(options.serveIndex.path, options.serveIndex.options)))
  return app
}
