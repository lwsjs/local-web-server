'use strict'
const test = require('tape')
const request = require('req-then')
const LocalWebServer = require('../../')
const c = require('../common')

test('mime override', function (t) {
  t.plan(2)
  const ws = new LocalWebServer()
  ws.addMimeOverride({ 'text/plain': [ 'php' ] })
  ws.addStatic(__dirname)
  const server = ws.getServer()
  server.listen(8100, () => {
    request('http://localhost:8100/something.php')
      .then(response => {
        t.strictEqual(response.res.statusCode, 200)
        t.ok(/text\/plain/.test(response.res.headers['content-type']))
      })
      .then(server.close.bind(server))
      .catch(c.fail(t))
  })
})
