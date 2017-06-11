'use strict'
const LwsCliApp = require('lws/lib/cli-app')

/**
 * @alias module:local-web-server
 */
class WsCliApp extends LwsCliApp {
  constructor (options) {
    super (options)
    /* override default serve command */
    this.commands.add(null, require('./command/serve'))
    /* add feature-list command */
    this.commands.add('feature-list', require('./command/feature-list'))
  }
}

module.exports = WsCliApp
