import EventEmitter from 'events'
import serveIndex from 'serve-index-75lb'

class Index extends EventEmitter {
  description () {
    return 'Serves directory listings.'
  }

  optionDefinitions () {
    return [
      {
        name: 'index.root',
        type: String,
        typeLabel: '{underline path}',
        description: 'Index root directory, defaults to the same value as --directory or the current directory.'
      },
      {
        name: 'index.hidden',
        type: Boolean,
        description: 'Show hidden files.'
      },
      {
        name: 'index.view',
        type: String,
        typeLabel: '{underline name}',
        description: 'Display mode, either `tiles` or `details`. Defaults to tiles.'
      }
    ]
  }

  middleware (options) {
    const path = options.indexRoot || options.directory || process.cwd()
    if (path) {
      const indexOptions = { icons: true }
      if (options.indexHidden !== undefined) indexOptions.hidden = options.indexHidden
      if (options.indexView !== undefined) indexOptions.view = options.indexView
      this.emit('verbose', 'middleware.index.config', indexOptions)
      const index = serveIndex(path, indexOptions)
      return function (ctx, next) {
        return new Promise((resolve, reject) => {
          function expressNext () {
            next()
            resolve()
          }
          index(ctx.req, ctx.res, expressNext, ctx)
        })
      }
    }
  }
}

export default Index
