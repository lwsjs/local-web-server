'use strict'
const arrayify = require('array-back')
const path = require('path')
const url = require('url')
const debug = require('debug')('local-web-server')
const mw = require('./middleware')

class MiddlewareStack extends Array {
  constructor (options) {
    super()
    this.options = options

    options = Object.assign({
      cacheControl: {},
      spa: null,
      compress: false,
      mime: {},
      forbid: [],
      rewrite: [],
      verbose: false,
      mocks: []
    }, options)

    if (options.verbose) {
      process.env.DEBUG = '*'
    }

    options.rewrite = arrayify(options.rewrite)
    options.forbid = arrayify(options.forbid)
    options.mocks = arrayify(options.mocks)
  }

  add (middleware) {
    this.push(middleware)
    return this
  }

  /**
   * allow from any origin
   */
  addCors () {
    this.push(require('kcors')())
    return this
  }

  /* pretty print JSON */
  addJson () {
    this.push(require('koa-json')())
    return this
  }

  /* rewrite rules */
  addRewrite () {
    const options = this.options.rewrite
    if (options.length) {
      options.forEach(route => {
        if (route.to) {
          /* `to` address is remote if the url specifies a host */
          if (url.parse(route.to).host) {
            const _ = require('koa-route')
            debug('proxy rewrite', `${route.from} -> ${route.to}`)
            this.push(_.all(route.from, mw.proxyRequest(route)))
          } else {
            const rewrite = require('koa-rewrite')
            const rmw = rewrite(route.from, route.to)
            rmw._name = 'rewrite'
            this.push(rmw)
          }
        }
      })
    }
    return this
  }

  /* must come after rewrite.
  See https://github.com/nodejitsu/node-http-proxy/issues/180. */
  addBodyParser () {
    this.push(require('koa-bodyparser')())
    return this
  }

  /* path blacklist */
  addBlacklist () {
    const options = this.options.forbid
    if (options.length) {
      debug('forbid', options.join(', '))
      this.push(mw.blacklist(options))
    }
    return this
  }

  /* cache */
  addCache () {
    if (!this.options['no-cache']) {
      this.push(require('koa-conditional-get')())
      this.push(require('koa-etag')())
    }
    return this
  }

  /* mime-type overrides */
  addMimeType () {
    const options = this.options.mime
    if (options) {
      debug('mime override', JSON.stringify(options))
      this.push(mw.mime(options))
    }
    return this
  }

  /* compress response */
  addCompression () {
    if (this.options.compress) {
      const compress = require('koa-compress')
      debug('compression', 'enabled')
      this.push(compress())
    }
    return this
  }

  /* Logging */
  addLogging (format, options) {
    format = this.options.server['log-format'] || format
    options = options || {}

    if (this.options.verbose && !format) {
      format = 'none'
    }

    if (format !== 'none') {
      const morgan = require('koa-morgan')

      if (!format) {
        const streamLogStats = require('stream-log-stats')
        options.stream = streamLogStats({ refreshRate: 500 })
        this.push(morgan('common', options))
      } else if (format === 'logstalgia') {
        morgan.token('date', () => {
          var d = new Date()
          return (`${d.getDate()}/${d.getUTCMonth()}/${d.getFullYear()}:${d.toTimeString()}`).replace('GMT', '').replace(' (BST)', '')
        })
        this.push(morgan('combined', options))
      } else {
        this.push(morgan(format, options))
      }
    }
    return this
  }

  /* Mock Responses */
  addMockResponses () {
    const options = this.options.mocks
    options.forEach(mock => {
      if (mock.module) {
        mock.responses = require(path.resolve(path.join(this.options.static.root, mock.module)))
      }

      if (mock.responses) {
        this.push(mw.mockResponses(mock.route, mock.responses))
      } else if (mock.response) {
        mock.target = {
          request: mock.request,
          response: mock.response
        }
        this.push(mw.mockResponses(mock.route, mock.target))
      }
    })
    return this
  }

  /* for any URL not matched by static (e.g. `/search`), serve the SPA */
  addSpa () {
    if (this.options.spa) {
      const historyApiFallback = require('koa-connect-history-api-fallback')
      debug('SPA', this.options.spa)
      this.push(historyApiFallback({
        index: this.options.spa,
        verbose: this.options.verbose
      }))
    }
    return this
  }

  /* serve static files */
  addStatic (root, options) {
    root = this.options.server.directory || root || process.cwd()
    options = Object.assign({ hidden: true }, options)
    if (root) {
      const serve = require('koa-static')
      this.push(serve(root, options))
    }
    return this
  }

  /* serve directory index */
  addIndex (path, options) {
    path = this.options.server.directory || path || process.cwd()
    options = Object.assign({ icons: true, hidden: true }, options)
    if (path) {
      const serveIndex = require('koa-serve-index')
      this.push(serveIndex(path, options))
    }
    return this
  }

  getMiddleware (options) {
    const compose = require('koa-compose')
    const convert = require('koa-convert')
    const middlewareStack = this.map(convert)
    return compose(middlewareStack)
  }
}

module.exports = MiddlewareStack
