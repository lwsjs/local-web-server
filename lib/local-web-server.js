'use strict'
const Lws = require('lws')

/**
 * @module local-web-server
 */

/**
 * @alias module:local-web-server
 */
class LocalWebServer extends Lws {
  constructor (options) {
    const path = require('path')
    const stack = [
      'lws-log',
      'lws-cors',
      'lws-json',
      'lws-rewrite',
      'lws-body-parser',
      'lws-blacklist',
      'lws-conditional-get',
      'lws-mime',
      'lws-compress',
      'lws-mock-response',
      'lws-spa',
      'lws-static',
      'lws-index'
    ].map(name => {
      return path.resolve(__dirname, `../node_modules/${name}`)
    })
    options = Object.assign({ stack }, options)
    super(options)
  }

  getVersion () {
    const path = require('path')
    const pkg = require(path.resolve(__dirname, '..', 'package.json'))
    return pkg.version
  }
}

module.exports = LocalWebServer
