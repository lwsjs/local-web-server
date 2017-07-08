const Lws = require('lws')
const path = require('path')

/**
 * @module local-web-server
 * @example
 * const LocalWebServer = require('local-web-server')
 * const localWebServer = new LocalWebServer()
 * const server = localWebServer.listen({
 *   port: port,
 *   directory: 'src'
 * })
 */

 /**
  * @alias module:local-web-server
  */
class LocalWebServer extends Lws {
  /**
   * Create a listening HTTP/HTTPS server.
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
   * @param [options.moduleDir] {string[]} - One or more directories to search for feature modules.
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
  }
}

module.exports = LocalWebServer
