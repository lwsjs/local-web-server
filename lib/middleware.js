'use strict'
const path = require('path')
const http = require('http')
const url = require('url')
const arrayify = require('array-back')
const t = require('typical')
const pathToRegexp = require('path-to-regexp')
const debug = require('debug')('local-web-server')

/**
 * @module middleware
 */
exports.proxyRequest = proxyRequest
exports.blacklist = blacklist
exports.mockResponses = mockResponses
exports.mime = mime

function proxyRequest (route) {
  const httpProxy = require('http-proxy')
  const proxy = httpProxy.createProxyServer({
    changeOrigin: true,
    secure: false
  })
  proxy.on('error', err => {
    // not worth crashing for
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

function blacklist (forbid) {
  return function blacklist (ctx, next) {
    if (forbid.some(expression => pathToRegexp(expression).test(ctx.path))) {
      ctx.throw(403, http.STATUS_CODES[403])
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

function mockResponses (route, targets) {
  targets = arrayify(targets)
  debug('mock route: %s, targets: %s', route, targets.length)
  const pathRe = pathToRegexp(route)

  return function mockResponse (ctx, next) {
    if (pathRe.test(ctx.path)) {
      const testValue = require('test-value')

      /* find a mock with compatible method and accepts */
      let target = targets.find(target => {
        return testValue(target, {
          request: {
            method: [ ctx.method, undefined ],
            accepts: type => ctx.accepts(type)
          }
        })
      })

      /* else take the first target without a request (no request means 'all requests') */
      if (!target) {
        target = targets.find(target => !target.request)
      }

      if (target) {
        if (t.isFunction(target.response)) {
          const pathMatches = ctx.path.match(pathRe).slice(1)
          return target.response.apply(null, [ctx].concat(pathMatches))
        } else if (t.isPlainObject(target.response)) {
          Object.assign(ctx.response, target.response)
        } else {
          throw new Error(`Invalid response: ${JSON.stringify(target.response)}`)
        }
      }
    } else {
      return next()
    }
  }
}
