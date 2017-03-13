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
    super({
      stack: [ 'log', 'static' ]
    })
  }
}

module.exports = LocalWebServer
