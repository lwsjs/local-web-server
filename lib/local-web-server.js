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
      stack: require('./default-stack')
    }, options)
    return super.create(options)
  }
}

module.exports = LocalWebServer
