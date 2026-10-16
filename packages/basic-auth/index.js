const EventEmitter = require('events')

class BasicAuth extends EventEmitter {
  description () {
    return 'Password-protect a server using Basic Authentication.'
  }

  optionDefinitions () {
    return [
      {
        name: 'auth.user',
        type: String,
        description: 'Basic authentication username'
      },
      {
        name: 'auth.pass',
        type: String,
        description: 'Basic authentication password'
      }
    ]
  }

  middleware (options) {
    if (options.authUser && options.authPass) {
      this.emit('verbose', 'basic-auth.config', { authUser: options.authUser, authPass: '**********' })
    }
    return (ctx, next) => {
      if (options.authUser && options.authPass) {
        const auth = require('basic-auth')
        const credentials = auth(ctx)
        if (!(credentials && credentials.name === options.authUser && credentials.pass === options.authPass)) {
          ctx.status = 401
          ctx.set('WWW-Authenticate', 'Basic realm="example"')
          ctx.body = 'Access denied'
        } else {
          return next()
        }
      } else {
        return next()
      }
    }
  }
}

module.exports = BasicAuth
