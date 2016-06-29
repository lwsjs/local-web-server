'use strict'
const test = require('tape')
const request = require('req-then')
const LocalWebServer = require('../')
const c = require('./common')
const path = require('path')

test('stack', function (t) {
  t.plan(2)
  const ws = new LocalWebServer({
    stack: [ path.resolve(__dirname, 'test-middleware.js') ]
  })
  const server = ws.getServer()
  server.listen(8100, () => {
    request('http://localhost:8100/')
      .then(c.checkResponse(t, 200, /1234512345/))
      .then(server.close.bind(server))
      .catch(c.fail(t))
  })
})

test('https', function (t) {
  t.plan(2)
  const ws = new LocalWebServer({
    stack: [ path.resolve(__dirname, 'test-middleware.js') ],
    https: true,
    port: 8100
  })
  ws.listen()
    .then(() => {
      request('https://localhost:8100/')
        .then(c.checkResponse(t, 200, /1234512345/))
        .then(ws.close.bind(ws))
        .catch(c.fail(t))
    })
})
