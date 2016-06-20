'use strict'
const test = require('tape')
const request = require('req-then')
const LocalWebServer = require('../../')
const c = require('../common')

test('forbid', function (t) {
  t.plan(2)
  const ws = new LocalWebServer()
  ws.addBlacklist([ '*.php', '*.html' ])
  ws.addStatic(__dirname)
  const server = ws.getServer()
  server.listen(8100, () => {
    request('http://localhost:8100/two.php')
      .then(c.checkResponse(t, 403))
      .then(() => request('http://localhost:8100/one.html'))
      .then(c.checkResponse(t, 403))
      .then(server.close.bind(server))
      .catch(c.fail(t))
  })
})
