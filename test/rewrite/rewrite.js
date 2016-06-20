'use strict'
const test = require('tape')
const request = require('req-then')
const LocalWebServer = require('../../')
const c = require('../common')

test('rewrite local', function (t) {
  t.plan(2)
  const ws = new LocalWebServer()
  ws.addRewrite([ { from: '/two.html', to: '/one.html' } ])
  ws.addStatic(__dirname)
  const server = ws.getServer()
  server.listen(8100, () => {
    request('http://localhost:8100/two.html')
      .then(c.checkResponse(t, 200, /one/))
      .then(server.close.bind(server))
      .catch(c.fail(t))
  })
})
