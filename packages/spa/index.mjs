import EventEmitter from 'events'
import path from 'path'
import fs from 'fs'
import send from 'koa-send'

class SPA extends EventEmitter {
  description () {
    return 'Support for Single Page Applications.'
  }

  optionDefinitions () {
    return [
      {
        name: 'spa',
        type: String,
        alias: 's',
        typeLabel: '{underline file}',
        description: 'Path to a Single Page App, e.g. app.html.'
      },
      {
        name: 'spa.asset-test',
        type: String,
        typeLabel: '{underline RegExp}',
        description: 'A regular expression to identify an asset file. Defaults to "\\.", meaning the server will only read from disk if the requested path contains a ".". This option is more efficient than `spa.asset-test-fs`.'
      },
      {
        name: 'spa.asset-test-fs',
        type: Boolean,
        description: 'Use the filesystem to identify an asset file. If the file exists on disk, serve it else return the SPA. If specified, `spa.asset-test` will be ignored. This option is less efficient but more reliable than `spa.asset-test`.'
      }
    ]
  }

  middleware (options) {
    const spa = options.spa
    if (spa) {
      const root = path.resolve(options.directory || process.cwd())
      this.emit('verbose', 'middleware.spa.config', { spa, root, spaAssetTest: options.spaAssetTest, spaAssetTestFs: options.spaAssetTestFs })
      return function (ctx, next) {
        const route = ctx.request.path
        let isStatic
        if (options.spaAssetTest) {
          const re = new RegExp(options.spaAssetTest)
          isStatic = re.test(route)
        } else if (options.spaAssetTestFs && route !== '/') {
          const url = new URL(route, 'http://localhost')
          const filePath = path.join(root, url.pathname)
          isStatic = fs.existsSync(filePath)
        } else {
          isStatic = /\./.test(route)
        }
        if (ctx.accepts('text/html') && !isStatic) {
          return send(ctx, spa, { root })
        } else {
          return next()
        }
      }
    }
  }
}

export default SPA
