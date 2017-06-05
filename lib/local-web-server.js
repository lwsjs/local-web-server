'use strict'
const Lws = require('lws')
const Serve = require('lws/lib/command/serve/serve')

/**
 * @module local-web-server
 */

class WsServe extends Serve {
  execute (options, argv) {
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
    options = {
      stack,
      'module-dir': moduleDir,
      'module-prefix': 'lws-'
    }
    super.execute(options, argv)
  }

  usage () {
    const sections = super.usage()
    sections.shift()
    sections.shift()
    sections.pop()
    sections.unshift(
      {
        header: 'local-web-server',
        content: 'A convenient local web server to support productive, full-stack Javascript development.'
      },
      {
        header: 'Synopsis',
        content: [
          '$ ws <options>',
          '$ ws [underline]{command} <options>'
        ]
      }
    )
    sections.push({
      content: 'Project home: [underline]{https://github.com/lwsjs/local-web-server}'
    })
    return sections
  }
}

/**
 * @alias module:local-web-server
 */
class LocalWebServer extends Lws {
  constructor (options) {
    super (options)
    this.commands.add(null, WsServe)
    this.commands.add('feature-list', require('./feature-list'))
  }

  getVersion () {
    const path = require('path')
    const pkg = require(path.resolve(__dirname, '..', 'package.json'))
    return pkg.version
  }
}

module.exports = LocalWebServer
