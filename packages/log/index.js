import EventEmitter from 'events'
import morgan from 'koa-morgan'
import streamLogStats from 'stream-log-stats'

class Log extends EventEmitter {
  description () {
    return 'Outputs an access log or stats view to the console.'
  }

  optionDefinitions () {
    return [{
      name: 'log.format',
      alias: 'f',
      type: String,
      description: "Possible values: 'stats', 'logstalgia' or anything defined by https://github.com/expressjs/morgan, typically 'dev', 'combined', 'short', 'tiny' or a custom format (e.g. ':method -> :url')"
    }]
  }

  middleware (config) {
    let format = config.logFormat

    if (format) {
      this.emit('verbose', 'middleware.log.config', { logFormat: config.logFormat })
      let stream

      if (format === 'stats') {
        stream = streamLogStats({ refreshRate: 500 })
        format = 'combined'

      /* logstalgia-specific output */
      } else if (format === 'logstalgia') {
        morgan.token('date', () => {
          var d = new Date()
          return (`${d.getDate()}/${d.getUTCMonth()}/${d.getFullYear()}:${d.toTimeString()}`).replace('GMT', '').replace(' (BST)', '')
        })
        format = 'combined'
      }
      return morgan(format, { stream })
    }
  }
}

export default Log
