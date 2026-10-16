import EventEmitter from 'events'
import koaCompress from 'koa-compress'

class Compress extends EventEmitter {
  description () {
    return 'Compress responses using gzip.'
  }

  optionDefinitions () {
    return [
      {
        name: 'compress',
        alias: 'z',
        type: Boolean,
        description: 'Serve gzip-compressed resources, where applicable.'
      },
      {
        name: 'compress.threshold',
        type: Number,
        description: 'Minimum response size in bytes to apply compression. Defaults to 1024.'
      }
    ]
  }

  middleware (options = {}) {
    const mwOptions = {}
    if (options.compress) mwOptions.compress = true
    if (options.compressThreshold) mwOptions.threshold = options.compressThreshold
    if (mwOptions.compress) {
      this.emit('verbose', 'middleware.compress.config', mwOptions)
      return koaCompress(mwOptions)
    }
  }
}

export default Compress
