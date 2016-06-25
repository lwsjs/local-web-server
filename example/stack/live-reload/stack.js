'use strict'
const LocalWebServer = require('../../../')
const liveReload = require('koa-livereload')
const DefaultStack = require('local-web-server-default-stack')

class LiveReloadStack extends DefaultStack {
  addAll () {
    return this.addLogging('dev')
      .add({ middleware: liveReload })
      .addStatic()
  }
}

module.exports = LiveReloadStack
