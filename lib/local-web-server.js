'use strict'
const path = require('path')
const http = require('http')
const url = require('url')
const arrayify = require('array-back')
let debug, pathToRegexp

/**
 * @module local-web-server
 */
module.exports = localWebServer

/**
 * Returns a Koa application you can launch or mix into an existing app.
 *
 * @param [options] {object} - options
 * @param [options.static] {object} - koa-static config
 * @param [options.static.root] {string} - root directory
 * @param [options.static.options] {string} - [options](https://github.com/koajs/static#options)
 * @param [options.serveIndex] {object} - koa-serve-index config
 * @param [options.serveIndex.path] {string} - root directory
 * @param [options.serveIndex.options] {string} - [options](https://github.com/expressjs/serve-index#options)
 * @param [options.forbid] {string[]} - A list of forbidden routes, each route being an [express route-path](http://expressjs.com/guide/routing.html#route-paths).
 * @param [options.spa] {string} - specify an SPA file to catch requests for everything but static assets.
 * @param [options.log] {object} - [morgan](https://github.com/expressjs/morgan) config
 * @param [options.log.format] {string} - [log format](https://github.com/expressjs/morgan#predefined-formats)
 * @param [options.log.options] {object} - [options](https://github.com/expressjs/morgan#options)
 * @param [options.compress] {boolean} - Serve gzip-compressed resources, where applicable
 * @param [options.mime] {object} - A list of mime-type overrides, passed directly to [mime.define()](https://github.com/broofa/node-mime#mimedefine)
 * @param [options.rewrite] {module:local-web-server~rewriteRule[]} - One or more rewrite rules
 * @param [options.verbose] {boolean} - Print detailed output, useful for debugging
 *
 * @alias module:local-web-server
 * @return {external:KoaApplication}
 * @example
 * const localWebServer = require('local-web-server')
 * localWebServer().listen(8000)
 */
function localWebServer (options) {
  options = Object.assign({
    static: {},
    serveIndex: {},
    spa: null,
    log: {},
    compress: false,
    mime: {},
    forbid: [],
    rewrite: [],
    verbose: false
  }, options)

  if (options.verbose) {
    process.env.DEBUG = '*'
  }

  const Koa = require('koa')
  const convert = require('koa-convert')
  const cors = require('kcors')
  const _ = require('koa-route')
  const json = require('koa-json')
  pathToRegexp = require('path-to-regexp')
  debug = require('debug')('local-web-server')
  const bodyParser = require('koa-bodyparser')

  const log = options.log
  log.options = log.options || {}

  const app = new Koa()
  const _use = app.use
  app.use = x => _use.call(app, convert(x))

  function verbose (category, message) {
    if (options.verbose) {
      debug(category, message)
    }
  }
  app._verbose = verbose

  if (options.verbose && !log.format)  {
    log.format = 'none'
  }

  /* CORS: allow from any origin */
  app.use(cors())

  /* pretty print JSON */
  app.use(json())

  /* request body parser */
  app.use(bodyParser())

  /* rewrite rules */
  if (options.rewrite && options.rewrite.length) {
    options.rewrite.forEach(route => {
      if (route.to) {
        if (url.parse(route.to).host) {
          verbose('proxy rewrite', `${route.from} -> ${route.to}`)
          app.use(_.all(route.from, proxyRequest(route, app)))
        } else {
          const rewrite = require('koa-rewrite')
          const mw = rewrite(route.from, route.to)
          mw._name = 'rewrite'
          app.use(mw)
        }
      }
    })
  }

  /* path blacklist */
  if (options.forbid.length) {
    verbose('forbid', options.forbid.join(', '))
    app.use(blacklist(options.forbid))
  }

  /* Cache */
  if (!options['no-cache']) {
    const conditional = require('koa-conditional-get')
    const etag = require('koa-etag')
    app.use(conditional())
    app.use(etag())
  }

  /* mime-type overrides */
  if (options.mime) {
    verbose('mime override', JSON.stringify(options.mime))
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

  /* compress response */
  if (options.compress) {
    const compress = require('koa-compress')
    verbose('compression', 'enabled')
    app.use(compress())
  }

  /* Logging */
  if (log.format !== 'none') {
    const morgan = require('koa-morgan')

    if (!log.format) {
      const streamLogStats = require('stream-log-stats')
      log.options.stream = streamLogStats({ refreshRate: 500 })
      app.use(morgan.middleware('common', log.options))
    } else if (log.format === 'logstalgia') {
      morgan.token('date', logstalgiaDate)
      app.use(morgan.middleware('combined', log.options))
    } else {
      app.use(morgan.middleware(log.format, log.options))
    }
  }

  /* Mock Responses */
  app.use(mockResponses({ root: options.static.root, verbose: verbose }))

  /* serve static files */
  if (options.static.root) {
    const serve = require('koa-static')
    app.use(serve(options.static.root, options.static.options))
  }

  /* serve directory index */
  if (options.serveIndex.path) {
    const serveIndex = require('koa-serve-index')
    app.use(serveIndex(options.serveIndex.path, options.serveIndex.options))
  }

  /* for any URL not matched by static (e.g. `/search`), serve the SPA */
  if (options.spa) {
    const send = require('koa-send')
    verbose('SPA', options.spa)
    app.use(_.all('*', function * () {
      yield send(this, options.spa, { root: path.resolve(options.static.root) || process.cwd() })
    }))
  }
  return app
}

function logstalgiaDate () {
  var d = new Date()
  return (`${d.getDate()}/${d.getUTCMonth()}/${d.getFullYear()}:${d.toTimeString()}`).replace('GMT', '').replace(' (BST)', '')
}

function proxyRequest (route, app) {
  const httpProxy = require('http-proxy')
  const proxy = httpProxy.createProxyServer({
    changeOrigin: true
  })

  return function * proxyMiddleware () {
    const next = arguments[arguments.length - 1]
    const keys = []
    route.re = pathToRegexp(route.from, keys)
    route.new = this.url.replace(route.re, route.to)

    keys.forEach((key, index) => {
      const re = RegExp(`:${key.name}`, 'g')
      route.new = route.new
        .replace(re, arguments[index] || '')
    })

    /* test no keys remain in the new path */
    keys.length = 0
    pathToRegexp(url.parse(route.new).path, keys)
    if (keys.length) {
      this.throw(500, `[PROXY] Invalid target URL: ${route.new}`)
      return next()
    }

    this.response = false
    app._verbose('proxy request', `from: ${this.path}, to: ${url.parse(route.new).href}`)

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

      const mockedReponse = {}
      /* resolve any functions on the mock */
      Object.keys(mock.response).forEach(key => {
        if (t.isFunction(mock.response[key])) {
          mockedReponse[key] = mock.response[key](ctx)
        } else {
          mockedReponse[key] = mock.response[key]
        }
      })

      if (mock) {
        Object.assign(ctx.response, mockedReponse)
        // options.verbose('mocked response', JSON.stringify(mockedReponse))
        // options.verbose('actual response', JSON.stringify(ctx.response))
      }
    } else {
      return next()
    }
  }
}

process.on('unhandledRejection', (reason, p) => {
  throw reason
})

/**
 * The `from` and `to` routes are specified using [express route-paths](http://expressjs.com/guide/routing.html#route-paths)
 *
 * @example
 * ```json
 * {
 *   "rewrite": [
 *     { "from": "/css/*", "to": "/build/styles/$1" },
 *     { "from": "/npm/*", "to": "http://registry.npmjs.org/$1" },
 *     { "from": "/:user/repos/:name", "to": "https://api.github.com/repos/:user/:name" }
 *   ]
 * }
 * ```
 *
 * @typedef rewriteRule
 * @property from {string} - request route
 * @property to {string} - target route
 */

/**
 * @external KoaApplication
 * @see https://github.com/koajs/koa/blob/master/docs/api/index.md#application
 */
