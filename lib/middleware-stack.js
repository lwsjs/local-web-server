'use strict'
const arrayify = require('array-back')
const path = require('path')
const url = require('url')
const debug = require('./debug')
const mw = require('./middleware')
const t = require('typical')
const compose = require('koa-compose')
const flatten = require('reduce-flatten')

class MiddlewareStack extends Array {
  add (middleware) {
    this.push(middleware)
    return this
  }

  /**
   * allow from any origin
   */
  addCors () {
    this.push({ middleware: require('kcors') })
    return this
  }

  /* pretty print JSON */
  addJson () {
    this.push({ middleware: require('koa-json') })
    return this
  }

  /* rewrite rules */
  addRewrite (rewriteRules) {
    this.push({
      optionDefinitions: {
        name: 'rewrite', alias: 'r', type: String, multiple: true,
        typeLabel: '[underline]{expression} ...',
        description: "A list of URL rewrite rules. For each rule, separate the 'from' and 'to' routes with '->'. Whitespace surrounded the routes is ignored. E.g. '/from -> /to'."
      },
      middleware: function (cliOptions) {
        const options = parseRewriteRules(arrayify(cliOptions.rewrite || rewriteRules))
        if (options.length) {
          return options.map(route => {
            if (route.to) {
              /* `to` address is remote if the url specifies a host */
              if (url.parse(route.to).host) {
                const _ = require('koa-route')
                debug('proxy rewrite', `${route.from} -> ${route.to}`)
                return _.all(route.from, mw.proxyRequest(route))
              } else {
                const rewrite = require('koa-rewrite')
                const rmw = rewrite(route.from, route.to)
                rmw._name = 'rewrite'
                return rmw
              }
            }
          })
        }
      }
    })
    return this
  }

  /* must come after rewrite.
  See https://github.com/nodejitsu/node-http-proxy/issues/180. */
  addBodyParser () {
    this.push({ middleware: require('koa-bodyparser') })
    return this
  }

  /* path blacklist */
  addBlacklist (forbidList) {
    this.push({
      optionDefinitions: {
        name: 'forbid', alias: 'b', type: String,
        multiple: true, typeLabel: '[underline]{path} ...',
        description: 'A list of forbidden routes.'
      },
      middleware: function (cliOptions) {
        forbidList = arrayify(cliOptions.forbid || forbidList)
        if (forbidList.length) {
          const pathToRegexp = require('path-to-regexp')
          debug('forbid', forbidList.join(', '))
          return function blacklist (ctx, next) {
            if (forbidList.some(expression => pathToRegexp(expression).test(ctx.path))) {
              ctx.status = 403
            } else {
              return next()
            }
          }
        }
      }
    })
    return this
  }

  /* cache */
  addCache () {
    this.push({
      optionDefinitions: {
        name: 'no-cache', alias: 'n', type: Boolean,
        description: 'Disable etag-based caching - forces loading from disk each request.'
      },
      middleware: function (cliOptions) {
        const noCache = cliOptions['no-cache']
        if (!noCache) {
          return [
            require('koa-conditional-get')(),
            require('koa-etag')()
          ]
        }
      }
    })
    return this
  }

  /* mime-type overrides */
  addMimeOverride (mime) {
    this.push({
      middleware: function (cliOptions) {
        mime = cliOptions.mime || mime
        if (mime) {
          debug('mime override', JSON.stringify(mime))
          return mw.mime(mime)
        }
      }
    })
    return this
  }

  /* compress response */
  addCompression (compress) {
    this.push({
      optionDefinitions: {
        name: 'compress', alias: 'c', type: Boolean,
        description: 'Serve gzip-compressed resources, where applicable.'
      },
      middleware: function (cliOptions) {
        compress = t.isDefined(cliOptions.compress)
          ? cliOptions.compress
          : compress
        if (compress) {
          debug('compression', 'enabled')
          return require('koa-compress')()
        }
      }
    })
    return this
  }

  /* Logging */
  addLogging (format, options) {
    options = options || {}
    this.push({
      optionDefinitions: {
        name: 'log-format',
        alias: 'f',
        type: String,
        description: "If a format is supplied an access log is written to stdout. If not, a dynamic statistics view is displayed. Use a preset ('none', 'dev','combined', 'short', 'tiny' or 'logstalgia') or supply a custom format (e.g. ':method -> :url')."
      },
      middleware: function (cliOptions) {
        format = cliOptions['log-format'] || format

        if (cliOptions.verbose && !format) {
          format = 'none'
        }

        if (format !== 'none') {
          const morgan = require('koa-morgan')

          if (!format) {
            const streamLogStats = require('stream-log-stats')
            options.stream = streamLogStats({ refreshRate: 500 })
            return morgan('common', options)
          } else if (format === 'logstalgia') {
            morgan.token('date', () => {
              var d = new Date()
              return (`${d.getDate()}/${d.getUTCMonth()}/${d.getFullYear()}:${d.toTimeString()}`).replace('GMT', '').replace(' (BST)', '')
            })
            return morgan('combined', options)
          } else {
            return morgan(format, options)
          }
        }
      }
    })
    return this
  }

  /* Mock Responses */
  addMockResponses (mocks) {
    this.push({
      middleware: function (cliOptions) {
        mocks = arrayify(cliOptions.mocks || mocks)
        return mocks.map(mock => {
          if (mock.module) {
            const modulePath = path.resolve(path.join(cliOptions.directory, mock.module))
            mock.responses = require(modulePath)
          }

          if (mock.responses) {
            return mw.mockResponses(mock.route, mock.responses)
          } else if (mock.response) {
            mock.target = {
              request: mock.request,
              response: mock.response
            }
            return mw.mockResponses(mock.route, mock.target)
          }
        })
      }
    })
    return this
  }

  /* for any URL not matched by static (e.g. `/search`), serve the SPA */
  addSpa (spa, assetTest) {
    this.push({
      optionDefinitions: {
        name: 'spa', alias: 's', type: String, typeLabel: '[underline]{file}',
        description: 'Path to a Single Page App, e.g. app.html.'
      },
      middleware: function (cliOptions) {
        spa = cliOptions.spa || spa || 'index.html'
        assetTest = new RegExp(cliOptions['spa-asset-test'] || assetTest || '\\.')
        if (spa) {
          const send = require('koa-send')
          const _ = require('koa-route')
          debug('SPA', spa)
          return _.get('*', function spaMw (ctx, route, next) {
            const root = path.resolve(cliOptions.directory || process.cwd())
            if (ctx.accepts('text/html') && !assetTest.test(route)) {
              debug(`SPA request. Route: ${route}, isAsset: ${assetTest.test(route)}`)
              return send(ctx, spa, { root: root }).then(next)
            } else {
              return send(ctx, route, { root: root }).then(next)
            }
          })
        }
      }
    })
    return this
  }

  /* serve static files */
  addStatic (root, options) {
    this.push({
      optionDefinitions: {
        name: 'directory', alias: 'd', type: String, typeLabel: '[underline]{path}',
        description: 'Root directory, defaults to the current directory.'
      },
      middleware: function (cliOptions) {
        /* update global cliOptions */
        cliOptions.directory = cliOptions.directory || root || process.cwd()
        options = Object.assign({ hidden: true }, options)
        if (cliOptions.directory) {
          const serve = require('koa-static')
          return serve(cliOptions.directory, options)
        }
      }
    })
    return this
  }

  /* serve directory index */
  addIndex (path, options) {
    this.push({
      middleware: function (cliOptions) {
        path = cliOptions.directory || path || process.cwd()
        options = Object.assign({ icons: true, hidden: true }, options)
        if (path) {
          const serveIndex = require('koa-serve-index')
          return serveIndex(path, options)
        }
      }
    })
    return this
  }

  getOptionDefinitions () {
    return this
      .filter(mw => mw.optionDefinitions)
      .map(mw => mw.optionDefinitions)
      .reduce(flatten, [])
      .map(def => {
        def.group = 'middleware'
        return def
      })
  }
  compose (options) {
    const convert = require('koa-convert')
    const middlewareStack = this
      .filter(mw => mw.middleware)
      .map(mw => mw.middleware)
      .map(middleware => middleware(options))
      .filter(middleware => middleware)
      .reduce(flatten, [])
      .map(convert)
    // console.error(require('util').inspect(middlewareStack, { depth: 3, colors: true }))
    return compose(middlewareStack)
  }
}

module.exports = MiddlewareStack

function parseRewriteRules (rules) {
  return rules && rules.map(rule => {
    if (t.isString(rule)) {
      const matches = rule.match(/(\S*)\s*->\s*(\S*)/)
      if (!(matches && matches.length >= 3)) throw new Error('Invalid rule: ' + rule)
      return {
        from: matches[1],
        to: matches[2]
      }
    } else {
      return rule
    }
  })
}
