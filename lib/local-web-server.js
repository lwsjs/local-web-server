'use strict'
const Lws = require('lws')

/**
 * @module local-web-server
 */

/**
 * @alias module:local-web-server
 */
class LocalWebServer extends Lws {
  constructor () {
    const path = require('path')
    const stack = [ 'lws-log', 'local-web-server-cors', 'local-web-server-json', 'lws-rewrite', 'local-web-server-body-parser', 'local-web-server-blacklist', 'local-web-server-conditional-get', 'local-web-server-mime', 'local-web-server-compress', 'local-web-server-mock-response', 'local-web-server-spa', 'local-web-server-static', 'local-web-server-index' ].map(name => {
      return path.resolve(__dirname, `../node_modules/${name}`)
    })
    super({ stack, 'config-name': 'local-web-server' })
  }

  getVersion () {
    const path = require('path')
    const pkg = require(path.resolve(__dirname, '..', 'package.json'))
    return pkg.version
  }
}

module.exports = LocalWebServer
