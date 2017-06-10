'use strict'
const Lws = require('lws')
const Serve = require('lws/lib/command/serve')
const path = require('path')

/**
 * @module local-web-server
 */

class WsServe extends Serve {
  execute (options, argv) {
    options = {
      stack: [
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
      ],
      moduleDir: path.resolve(__dirname, `../node_modules`),
      modulePrefix: 'lws-'
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
    /* override default serve command */
    this.commands.add(null, WsServe)
    /* add feature-list command */
    this.commands.add('feature-list', require('./feature-list'))
  }

  getVersion () {
    const pkg = require(path.resolve(__dirname, '..', 'package.json'))
    return pkg.version
  }
}

module.exports = LocalWebServer
