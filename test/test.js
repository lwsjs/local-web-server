'use strict'
const test = require('tape')
const request = require('req-then')
const LocalWebServer = require('../')
const c = require('./common')
const path = require('path')

test('stack', function (t) {
  t.plan(2)
  const ws = new LocalWebServer({
    stack: [ path.resolve(__dirname, 'test-middleware.js') ],
    port: 8100,
    ignoreCli: true
  })
  const server = ws.getServer(() => {
    return request('http://localhost:8100/')
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
    port: 8100,
    ignoreCli: true
  })
  const server = ws.getServer(() => {
    return request('https://localhost:8100/')
      .then(c.checkResponse(t, 200, /1234512345/))
      .then(server.close.bind(server))
  })
})
