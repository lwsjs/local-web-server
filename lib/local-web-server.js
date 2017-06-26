const Lws = require('lws')
const path = require('path')

class LocalWebServer extends Lws {
  create (options) {
    const usage = require('lws/lib/usage')
    usage.defaults
      .set('an', 'ws')
      .set('av', require('../package').version)
      .set('cd4', 'api')
    options = Object.assign({
      moduleDir: path.resolve(__dirname, `../node_modules`),
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
    return super.create(options)
  }
}

module.exports = LocalWebServer
