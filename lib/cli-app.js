'use strict'
const LwsCliApp = require('lws/lib/cli-app')

class WsCliApp extends LwsCliApp {
  constructor (options) {
    super (options)
    /* override default serve command */
    this.commands.add(null, require('./command/serve'))
    /* add middleware-list command */
    this.commands.add('middleware-list', require('./command/middleware-list'))
  }
}

module.exports = WsCliApp
