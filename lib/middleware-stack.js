'use strict'
const arrayify = require('array-back')
const path = require('path')
const url = require('url')
const debug = require('debug')('local-web-server')
const mw = require('./middleware')
const t = require('typical')

class MiddlewareStack extends Array {
  constructor (options) {
    super()
    this.options = options

    if (options.verbose) {
      process.env.DEBUG = '*'
    }
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
  addRewrite (rewriteRules) {
    const options = arrayify(this.options.server.rewrite || rewriteRules)
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
  addBlacklist (forbidList) {
    forbidList = arrayify(this.options.server.forbid || forbidList)
    if (forbidList.length) {
      const pathToRegexp = require('path-to-regexp')
      debug('forbid', forbidList.join(', '))
      this.push(function blacklist (ctx, next) {
        if (forbidList.some(expression => pathToRegexp(expression).test(ctx.path))) {
          ctx.throw(403, http.STATUS_CODES[403])
        } else {
          return next()
        }
      })
    }
    return this
  }

  /* cache */
  addCache () {
    const noCache = this.options.server['no-cache']
    if (!noCache) {
      this.push(require('koa-conditional-get')())
      this.push(require('koa-etag')())
    }
    return this
  }

  /* mime-type overrides */
  addMimeType (mime) {
    mime = this.options.server.mime || mime
    if (mime) {
      debug('mime override', JSON.stringify(mime))
      this.push(mw.mime(mime))
    }
    return this
  }

  /* compress response */
  addCompression (compress) {
    compress = t.isDefined(this.options.server.compress)
      ? this.options.server.compress
      : compress
    if (compress) {
      debug('compression', 'enabled')
      this.push(require('koa-compress')())
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
  addMockResponses (mocks) {
    mocks = arrayify(this.options.server.mocks || mocks)
    mocks.forEach(mock => {
      if (mock.module) {
        // TODO: ENSURE this.options.static.root is correct value
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
  addSpa (spa) {
    spa = t.isDefined(this.options.server.spa) ? this.options.server.spa : spa
    if (spa) {
      const historyApiFallback = require('koa-connect-history-api-fallback')
      debug('SPA', spa)
      this.push(historyApiFallback({
        index: spa,
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

  compose (options) {
    const compose = require('koa-compose')
    const convert = require('koa-convert')
    const middlewareStack = this.map(convert)
    return compose(middlewareStack)
  }
}

module.exports = MiddlewareStack
