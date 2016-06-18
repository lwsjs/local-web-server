'use strict'
const Cli = require('../../')
const liveReload = require('koa-livereload')

const ws = new Cli()
ws.addLogging('dev')
  .add({
    optionDefinitions: {
      name: 'live-reload', type: Boolean,
      description: 'Add live reload.'
    },
    middleware: function (options) {
      if (options['live-reload']) {
        return liveReload()
      }
    }
  })
  .addStatic()
  .start()
