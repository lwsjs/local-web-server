const Lws = require('lws')
const path = require('path')

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
 */

 /**
  * @alias module:local-web-server
  */
class LocalWebServer extends Lws {
  /**
   * Returns a listening HTTP/HTTPS server.
   * @param [options] {object} - Server options
   * @param [options.port] {number} - Port
   * @param [options.hostname] {string} -The hostname (or IP address) to listen on. Defaults to 0.0.0.0.
   * @param [options.maxConnections] {number} - The maximum number of concurrent connections supported by the server.
   * @param [options.keepAliveTimeout] {number} - The period (in milliseconds) of inactivity a connection will remain open before being destroyed. Set to `0` to keep connections open indefinitely.
   * @param [options.configFile] {string} - Config file path, defaults to 'lws.config.js'.
   * @param [options.https] {boolean} - Enable HTTPS using a built-in key and cert registered to the domain 127.0.0.1.
   * @param [options.key] {string} - SSL key file path. Supply along with --cert to launch a https server.
   * @param [options.cert] {string} - SSL cert file path. Supply along with --key to launch a https server.
   * @param [options.pfx] {string} - Path to an PFX or PKCS12 encoded private key and certificate chain. An alternative to providing --key and --cert.
   * @param [options.ciphers] {string} - Optional cipher suite specification, replacing the default.
   * @param [options.secureProtocol] {string} - Optional SSL method to use, default is "SSLv23_method".
   * @param [options.stack] {string[]|Middlewares[]} - Array of feature classes, or filenames of modules exporting a feature class.
   * @param [options.server] {string|ServerFactory} - Custom server factory, e.g. lws-http2.
   * @param [options.websocket] {string|Websocket} - Path to a websocket module
   * @param [options.moduleDir] {string[]} - One or more directories to search for modules.
   * @returns {Server}
   */
  listen (options) {
    const usage = require('lws/lib/usage')
    usage.defaults
      .set('an', 'ws')
      .set('av', require('../package').version)
      .set('cd4', 'api')
    options = Object.assign({
      moduleDir: path.resolve(__dirname, `../node_modules`),
      modulePrefix: 'lws-',
      stack: require('./default-stack')
    }, options)
    return super.listen(options)

    /**
     * Highly-verbose debug information event stream.
     *
     * @event module:local-web-server#verbose
     * @param key {string} - An identifying string, e.g. `server.socket.data`.
     * @param value {*} - The value, e.g. `{ socketId: 1, bytesRead: '3 Kb' }`.
     */
  }
}

module.exports = LocalWebServer
