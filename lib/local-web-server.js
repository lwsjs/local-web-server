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

  // app.use(_.all('/api/*', function * (apiPath) {
  //   this.response = false
  //   proxy.once('proxyReq', function (proxyReq, req, res, options) {
  //     proxyReq.path = `http://registry.npmjs.org/${apiPath}`;
  //   })
  //   proxy.web(this.req, this.res, { target: `http://registry.npmjs.org/${apiPath}` })
  // }))
  // app.use(mount('/gh', function * (next) {
  //   this.response = false
  //   proxy.web(this.req, this.res, { target: 'https://api.github.com' })
  // }))
  // app.use(_.get('/:one/gh/:two', function * (one, two) {
  //   this.response = false
  //   proxy.once('proxyReq', function (proxyReq, req, res, options) {
  //     proxyReq.path = `https://api.github.com/${one}/${two}`;
  //   })
  //   proxy.web(this.req, this.res, { target: `https://api.github.com/${one}/${two}` })
  // }))
  // app.use(_.get('/*/yeah/:one/*', function * (one, two) {
    // console.log(arguments);
    // this.response = false
    // proxy.once('proxyReq', function (proxyReq, req, res, options) {
    //   proxyReq.path = `https://api.github.com/${one}/${two}`;
    // })
    // proxy.web(this.req, this.res, { target: `https://api.github.com/${one}/${two}` })
  // }))

  // const proxyRoutes = [
  //   // { mount: '/api', to: 'http://registry.npmjs.org' },
  //   // { mount: '/gh', to: 'http://https://api.github.com' },
  //   { from: '/:one/gh/:two', to: 'https://api.github.com/${one}/${two}' },
  //   { from: '/api/*', to: 'http://registry.npmjs.org/${0}' },
  // ]

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

        // console.log('==========');
        // console.log(arguments);
        // console.log(re);
        // console.log(index);
        // console.log(route);

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
        ctx.throw(403, 'Blacklisted')
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
