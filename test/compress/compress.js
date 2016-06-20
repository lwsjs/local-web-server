'use strict'
const test = require('tape')
const request = require('req-then')
const LocalWebServer = require('../../')
const c = require('../common')

test('compress', function (t) {
  t.plan(2)
  const ws = new LocalWebServer()
  ws.addCompression(true)
  ws.addStatic(__dirname)
  const server = ws.getServer()
  server.listen(8100, () => {
    request('http://localhost:8100/big-file.txt', { headers: { 'Accept-Encoding': 'gzip' } })
      .then(response => {
        t.strictEqual(response.res.statusCode, 200)
        t.strictEqual(response.res.headers['content-encoding'], 'gzip')
      })
      .then(server.close.bind(server))
      .catch(c.fail(t))
  })
})
