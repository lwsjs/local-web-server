import kcors from '@koa/cors'
import EventEmitter from 'events'

class Cors extends EventEmitter {
  description () {
    return 'Support for setting Cross-Origin Resource Sharing (CORS) headers.'
  }

  optionDefinitions () {
    return [
      {
        name: 'cors.origin',
        description: 'Set a `Access-Control-Allow-Origin` value. Default is the request Origin header.'
      },
      {
        name: 'cors.allow-methods',
        description: 'Set a `Access-Control-Allow-Methods` value. Default is "GET,HEAD,PUT,POST,DELETE,PATCH"'
      },
      {
        name: 'cors.credentials',
        type: Boolean,
        description: 'Set this flag to add `Access-Control-Allow-Credentials` header.'
      },
      {
        name: 'cors.opener-policy',
        description: 'Set a value for the `Cross-Origin-Opener-Policy` header (specify `unsafe-none`, same-origin-allow-popups` or `same-origin`).'
      },
      {
        name: 'cors.embedder-policy',
        description: 'Set a value for the `Cross-Origin-Embedder-Policy` header (specify `unsafe-none` or `require-corp`).'
      },
      {
        name: 'cors.private-network-access',
        type: Boolean,
        description: 'Set this flag to enable `Access-Control-Request-Private-Network` support.'
      }
    ]
  }

  middleware (config) {
    const corsOptions = {}
    if (config.corsOrigin) corsOptions.origin = config.corsOrigin
    if (config.corsAllowMethods) corsOptions.allowMethods = config.corsAllowMethods
    if (config.corsCredentials) corsOptions.credentials = config.corsCredentials
    if (config.corsPrivateNetworkAccess) corsOptions.privateNetworkAccess = config.corsPrivateNetworkAccess

    /* See https://github.com/koajs/cors/issues/94 */
    corsOptions.origin = function origin (ctx) {
      return config.corsOrigin || ctx.get('origin') || '*'
    }

    this.emit('verbose', 'middleware.cors.config', {
      ...corsOptions,
      openerPolicy: config.corsOpenerPolicy,
      embedderPolicy: config.corsEmbedderPolicy
    })
    const koaCorsMiddleware = kcors(corsOptions)

    return async function (ctx, next) {
      await koaCorsMiddleware(ctx, next)
      if (config.corsOpenerPolicy) {
        ctx.response.set('Cross-Origin-Opener-Policy', config.corsOpenerPolicy)
      }
      if (config.corsEmbedderPolicy) {
        ctx.response.set('Cross-Origin-Embedder-Policy', config.corsEmbedderPolicy)
      }
    }
  }
}

export default Cors
