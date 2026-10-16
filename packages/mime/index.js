const EventEmitter = require('events')

class Mime extends EventEmitter {
  description () {
    return 'Customise the mime-type returned with any static resource.'
  }

  middleware (config) {
    const mimeTypes = config.mime
    if (mimeTypes) {
      this.emit('verbose', 'middleware.mime.config', { mime: mimeTypes })
      return async function (ctx, next) {
        await next()
        const path = require('path')
        const reqPathExtension = path.extname(ctx.path).slice(1)
        Object.keys(mimeTypes).forEach(mimeType => {
          const extsToOverride = mimeTypes[mimeType]
          if (extsToOverride.indexOf(reqPathExtension) > -1) ctx.type = mimeType
        })
      }
    }
  }
}

module.exports = Mime
