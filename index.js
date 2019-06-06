const Lws = require('lws')

/**
 * @module local-web-server
 * @emits module:local-web-server#verbose
 * @example
 * const LocalWebServer = require('local-web-server')
 * const localWebServer = new LocalWebServer()
 * const server = localWebServer.listen({
 *   port: 8050,
 *   https: true,
 *   directory: 'src',
 *   spa: 'index.html',
 *   websocket: 'src/websocket-server.js'
 * })
 * // secure, SPA server with listening websocket now ready on port 8050
 *
 * // shut down the server
 * server.close()
 */

/**
  * @alias module:local-web-server
  */
class LocalWebServer extends Lws {
  _getDefaultConfig () {
    return Object.assign(super._getDefaultConfig(), {
      moduleDir: [ __dirname, '.' ],
      stack: require('./lib/default-stack')
    })
  }
}

module.exports = LocalWebServer
