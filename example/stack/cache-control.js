'use strict'
const LocalWebServer = require('../../')
const cacheControl = require('koa-cache-control')
const DefaultStack = require('local-web-server-default-stack')

class CacheControl extends DefaultStack {
  addAll () {
    this.addLogging('dev')
      .add({
        optionDefinitions: {
          name: 'maxage', type: Number,
          description: 'The maxage to set on each response.'
        },
        middleware: function (options) {
          return cacheControl({ maxAge: options.maxage })
        }
      })
      .addStatic()
      .addIndex()
  }
}

module.exports = CacheControl
