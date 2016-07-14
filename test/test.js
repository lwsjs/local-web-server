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
    testMode: true
  })
  const server = ws.getServer(() => {
    return request('http://localhost:8100/')
      .then(c.checkResponse(t, 200, /1234512345/))
      .then(server.close.bind(server))
      .catch(err => {
        t.fail(err.message)
        server.close()
      })
  })
})

test('https', function (t) {
  t.plan(2)
  const ws = new LocalWebServer({
    stack: [ path.resolve(__dirname, 'test-middleware.js') ],
    https: true,
    port: 8100,
    testMode: true
  })
  const url = require('url')
  const reqOptions = url.parse('https://localhost:8100/')
  reqOptions.rejectUnauthorized = false
  const server = ws.getServer(() => {
    return request(reqOptions)
      .then(c.checkResponse(t, 200, /1234512345/))
      .then(server.close.bind(server))
      .catch(err => {
        t.fail(err.message)
        server.close()
      })
  })
})
