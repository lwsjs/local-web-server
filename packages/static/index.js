import EventEmitter from 'events'
import serve from 'koa-static'
import arrayBack from 'array-back'

class Static extends EventEmitter {
  description () {
    return 'Serves static files.'
  }

  optionDefinitions () {
    return [
      {
        name: 'directory',
        alias: 'd',
        type: String,
        typeLabel: '{underline path}',
        description: 'Root directory, defaults to the current directory.'
      },
      {
        name: 'static.maxage',
        type: Number,
        description: 'Cache max-age (in seconds) applied to all resources served.'
      },
      {
        name: 'static.defer',
        type: Boolean,
        description: 'If true, serves after `await next`, allowing any downstream middleware to respond first.'
      },
      {
        name: 'static.index',
        type: String,
        typeLabel: '{underline path}',
        description: 'Default file name, defaults to `index.html`.'
      },
      {
        name: 'static.extensions',
        type: String,
        multiple: true,
        typeLabel: '{underline ext}',
        description: 'One or more default filename extensions. For example, if you set `--static.extensions html` and request `/page` then the server will look for both `page` and `page.html` on disk, serving the latter.'
      }
    ]
  }

  middleware (config) {
    const directory = config.directory || process.cwd()
    const staticOptions = { hidden: true }
    if (config.staticDefer) staticOptions.defer = config.staticDefer
    if (config.staticMaxage) staticOptions.maxage = config.staticMaxage * 1000
    if (config.staticIndex) staticOptions.index = config.staticIndex
    if (config.staticExtensions) staticOptions.extensions = arrayBack(config.staticExtensions)
    if (directory) {
      staticOptions.root = directory
      this.emit('verbose', 'middleware.static.config', staticOptions)
      return serve(directory, staticOptions)
    }
  }
}

export default Static
