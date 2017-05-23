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
    let stack = [
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
    ]
    const moduleDir = path.resolve(__dirname, `../node_modules`)
    options = Object.assign({ stack, 'module-dir': moduleDir, 'module-prefix': 'lws-' }, options)
    super(options)

    /* add command */
    this.commands.set('feature-list', require('./feature-list'))
  }

  getVersion () {
    const path = require('path')
    const pkg = require(path.resolve(__dirname, '..', 'package.json'))
    return pkg.version
  }

  getUsageHeader () {
    return {
      header: 'local-web-server',
      content: 'A convenient local web server to support productive, full-stack Javascript development.'
    }
  }

  getUsageFooter () {
    return {
      content: 'Project home: [underline]{https://github.com/lwsjs/local-web-server}'
    }
  }
}

module.exports = LocalWebServer
