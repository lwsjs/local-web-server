'use strict'
const path = require('path')
const url = require('url')
const arrayify = require('array-back')
const t = require('typical')
const pathToRegexp = require('path-to-regexp')
const debug = require('./debug')

/**
 * @module middleware
 */
exports.proxyRequest = proxyRequest
exports.mime = mime

function proxyRequest (route) {
  const httpProxy = require('http-proxy')
  const proxy = httpProxy.createProxyServer({
    changeOrigin: true,
    secure: false
  })

  return function proxyMiddleware () {
    const keys = []
    route.re = pathToRegexp(route.from, keys)
    route.new = this.url.replace(route.re, route.to)

    keys.forEach((key, index) => {
      const re = RegExp(`:${key.name}`, 'g')
      route.new = route.new
        .replace(re, arguments[index + 1] || '')
    })

    debug('proxy request', `from: ${this.path}, to: ${url.parse(route.new).href}`)

    return new Promise((resolve, reject) => {
      proxy.once('error', err => {
        err.message = `[PROXY] Error: ${err.message} Target: ${route.new}`
        reject(err)
      })
      proxy.once('proxyReq', function (proxyReq) {
        proxyReq.path = url.parse(route.new).path
      })
      proxy.once('close', resolve)
      proxy.web(this.req, this.res, { target: route.new })
    })
  }
}

function mime (mimeTypes) {
  return function mime (ctx, next) {
    return next().then(() => {
      const reqPathExtension = path.extname(ctx.path).slice(1)
      Object.keys(mimeTypes).forEach(mimeType => {
        const extsToOverride = mimeTypes[mimeType]
        if (extsToOverride.indexOf(reqPathExtension) > -1) ctx.type = mimeType
      })
    })
  }
}
