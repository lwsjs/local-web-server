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
    const stack = [ 'log', 'cors', 'json', 'rewrite', 'body-parser', 'blacklist', 'conditional-get', 'mime', 'compress', 'mock-response', 'spa', 'static', 'index' ].map(name => {
      return path.resolve(__dirname, `../node_modules/local-web-server-${name}`)
    })
    super({ stack })
  }
}

module.exports = LocalWebServer
