const Lws = require('lws')

/**
 * @module local-web-server
 */

/**
  * @alias module:local-web-server
  */
class LocalWebServer extends Lws {
  _getDefaultConfig () {
    return Object.assign(super._getDefaultConfig(), {
      moduleDir: [ '.', __dirname ],
      stack: require('./lib/default-stack')
    })
  }
}

module.exports = LocalWebServer
