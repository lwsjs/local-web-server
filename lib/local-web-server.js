'use strict'
const path = require('path')
const http = require('http')
const url = require('url')
const Koa = require('koa')
const convert = require('koa-convert')
const cors = require('kcors')
const _ = require('koa-route')
const mount = require('koa-mount')
const pathToRegexp = require('path-to-regexp')

/**
 * @module local-web-server
 */
module.exports = localWebServer

/**
 * Returns a Koa application
 *
 * @param [options] {object} - options
 * @param [options.forbid] {regexp[]} - a list of forbidden routes.
 * @alias module:local-web-server
 * @example
 * const localWebServer = require('local-web-server')
 * localWebServer().listen(8000)
 */
function localWebServer (options) {
  options = Object.assign({
    static: {},
    serveIndex: {},
    log: {},
    compress: false,
    forbid: [],
    directories: [],
    proxyRoutes: [],
    rewrite: []
  }, options)

  const log = options.log
  log.options = log.options || {}

  const app = new Koa()
  const _use = app.use
  app.use = x => _use.call(app, convert(x))


  /* Proxy routes */
  if (options.proxyRoutes.length) {
    const httpProxy = require('http-proxy')
    const proxy = httpProxy.createProxyServer({
      changeOrigin: true
    })
    options.proxyRoutes.forEach(route => {
      app.use(_.all(route.from, function * () {
        const keys = []
        route.re = pathToRegexp(route.from, keys)
        route.new = route.to

        this.response = false
        keys.forEach((key, index) => {
          const re = {
            token: RegExp('\\$\\{' + key.name + '\\}', 'g'),
            index: RegExp('\\$\\{' + index + '\\}', 'g')
          }
          route.new = route.new
            .replace(re.token, arguments[index] || '')
            .replace(re.index, arguments[index] || '')
        })
        proxy.once('proxyReq', function (proxyReq) {
          proxyReq.path = url.parse(route.new).path;
        })
        proxy.web(this.req, this.res, { target: route.new })
      }))
    })
  }

  /* Rewrite rules */
  if (options.rewrite && options.rewrite.length) {
    const rewrite = require('koa-rewrite')
    options.rewrite.forEach(rule => {
      app.use(rewrite(rule.from, rule.to))
    })
  }

  /* CORS: allow from any origin */
  app.use(cors())

  /* path blacklist */
  if (options.forbid.length) {
    app.use(function blacklist (ctx, next) {
      if (options.forbid.some(regexp => regexp.test(ctx.path))) {
        ctx.throw(403, http.STATUS_CODES[403])
      } else {
        return next()
      }
    })
  }

  /* Cache */
  if (!options['no-cache']) {
    const conditional = require('koa-conditional-get');
    const etag = require('koa-etag');
    app.use(conditional())
    app.use(etag())
  }

  /* mime-type overrides */
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

  /* compress response */
  if (options.compress) {
    const compress = require('koa-compress')
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
    app.use(_.all('*', function * () {
      yield send(this, options.spa, { root: process.cwd() })
    }))
  }
  return app
}

function logstalgiaDate () {
  var d = new Date()
  return (`${d.getDate()}/${d.getUTCMonth()}/${d.getFullYear()}:${d.toTimeString()}`)
    .replace('GMT', '')
    .replace(' (BST)', '')
}

process.on('unhandledRejection', (reason, p) => {
  throw reason
})
