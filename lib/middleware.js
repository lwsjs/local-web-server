'use strict'
const path = require('path')
const http = require('http')
const url = require('url')
const arrayify = require('array-back')
const pathToRegexp = require('path-to-regexp')
const debug = require('debug')('local-web-server')

/**
 * @module middleware
 */
exports.proxyRequest = proxyRequest
exports.blacklist = blacklist
exports.mockResponses = mockResponses
exports.mime = mime

function proxyRequest (route, app) {
  const httpProxy = require('http-proxy')
  const proxy = httpProxy.createProxyServer({
    changeOrigin: true
  })

  return function proxyMiddleware () {
    const next = arguments[arguments.length - 1]
    const keys = []
    route.re = pathToRegexp(route.from, keys)
    route.new = this.url.replace(route.re, route.to)

    keys.forEach((key, index) => {
      const re = RegExp(`:${key.name}`, 'g')
      route.new = route.new
        .replace(re, arguments[index + 1] || '')
    })

    /* test no keys remain in the new path */
    keys.length = 0
    pathToRegexp(url.parse(route.new).path, keys)
    if (keys.length) {
      this.throw(500, `[PROXY] Invalid target URL: ${route.new}`)
      return next()
    }

    this.response = false
    debug('proxy request', `from: ${this.path}, to: ${url.parse(route.new).href}`)

    proxy.once('error', err => {
      this.throw(500, `[PROXY] ${err.message}: ${route.new}`)
    })
    proxy.once('proxyReq', function (proxyReq) {
      proxyReq.path = url.parse(route.new).path
    })
    proxy.web(this.req, this.res, { target: route.new })
  }
}

function blacklist (forbid) {
  return function blacklist (ctx, next) {
    if (forbid.some(expression => pathToRegexp(expression).test(ctx.path))) {
      ctx.throw(403, http.STATUS_CODES[403])
    } else {
      return next()
    }
  }
}

function mockResponses (options) {
  options = options || { root: process.cwd() }
  return function mockResponses (ctx, next) {
    if (/\.mock.js$/.test(ctx.path)) {
      const mocks = arrayify(require(path.join(options.root, ctx.path)))
      const testValue = require('test-value')
      const t = require('typical')

      /* find a mock with compatible method and accepts */
      let mock = mocks.find(mock => {
        return testValue(mock, {
          request: {
            method: [ ctx.method, undefined ],
            accepts: type => ctx.accepts(type)
          }
        })
      })

      /* else take the first mock without a request (no request means 'all requests') */
      if (!mock) {
        mock = mocks.find(mock => !mock.request)
      }

      if (mock) {
        let mockedResponse = mock.response
        if (t.isFunction(mock.response)) {
          mockedResponse = new mock.response(ctx)
        }
        debug('mock response: %j', mockedResponse)
        Object.assign(ctx.response, mockedResponse)
      }
    } else {
      return next()
    }
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
