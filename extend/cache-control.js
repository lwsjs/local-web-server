'use strict'
const LocalWebServer = require('../')
const cacheControl = require('koa-cache-control')

const optionDefinitions = { name: 'maxage', type: Number, defaultValue: 1000 }

const ws = new LocalWebServer()
ws.addLogging('dev')
  .add({
    optionDefinitions: optionDefinitions,
    middleware: function (options) {
      return cacheControl({ maxAge: options.maxage })
    }
  })
  .addStatic()
  .addIndex()
  .start()
