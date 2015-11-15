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
const conditional = require('koa-conditional-get');
const etag = require('koa-etag');
const _ = require('koa-route')
const mount = require('koa-mount')
const httpProxy = require('http-proxy')
const pathToRegexp = require('path-to-regexp')
const http = require('http')

/**
 * @module local-web-server
 */
module.exports = getApp

function getApp (options) {
  options = Object.assign({
    static: {},
    serveIndex: {},
    log: {},
    compress: false,
    blacklist: [],
    directories: [],
    proxyRoutes: []
  }, options)

  const log = options.log
  log.options = log.options || {}

  const app = new Koa()
  const _use = app.use
  app.use = x => _use.call(app, convert(x))

  const proxy = httpProxy.createProxyServer({
    changeOrigin: true
  })

  /* Proxy routes */
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
        proxyReq.path = route.new;
      })
      proxy.web(this.req, this.res, { target: route.new })
    }))
  })

  /* CORS: allow from any origin */
  app.use(cors())

  /* path blacklist */
  if (options.blacklist.length) {
    app.use(function pathBlacklist (ctx, next) {
      if (options.blacklist.some(regexp => regexp.test(ctx.path))) {
        ctx.throw(403, http.STATUS_CODES[403])
      } else {
        return next()
      }
    })
  }

  app.use(conditional())
  app.use(etag())

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
    app.use(compress())
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
  if (log.format) app.use(morgan.middleware(log.format, log.options))

  // options.static.root = [
  //   { route: '/one', root: 'lib' },
  //   { route: '/two', root: 'node_modules' }
  // ]
  /* serve static files */
  if (options.static.root) {
    app.use(serve(options.static.root, options.static.options))
    // options.static.root.forEach(config => {
    //   app.use(mount(config.route, serve(config.root)))
    //   app.use(mount(config.route, serveIndex(config.root)))
    // })
  }

  /* serve directory index */
  if (options.serveIndex.path) {
    app.use(serveIndex(options.serveIndex.path, options.serveIndex.options))
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
