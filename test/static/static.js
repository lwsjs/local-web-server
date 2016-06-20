'use strict'
const test = require('tape')
const request = require('req-then')
const LocalWebServer = require('../../')
const c = require('../common')

test('static', function (t) {
  t.plan(2)
  const ws = new LocalWebServer()
  ws.addStatic(__dirname, { index: 'file.txt' })
  const server = ws.getServer()
  server.listen(8100, () => {
    request('http://localhost:8100/')
      .then(c.checkResponse(t, 200, /test/))
      .then(server.close.bind(server))
      .catch(c.fail(t))
  })
})
