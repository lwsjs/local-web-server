const Lws = require('lws')
const path = require('path')

class LocalWebServer extends Lws {
  constructor (options) {
    options = Object.assign({
      moduleDir: path.resolve(__dirname, `../../node_modules`),
      modulePrefix: 'lws-',
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
      ]
    }, options)
    super(options)
  }
}

module.exports = LocalWebServer
