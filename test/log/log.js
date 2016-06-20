'use strict'
const test = require('tape')
const request = require('req-then')
const LocalWebServer = require('../../')
const c = require('../common')

test('logging', function (t) {
  t.plan(2)
  const ws = new LocalWebServer()

  const stream = require('stream').PassThrough()
  stream.on('readable', () => {
    let chunk = stream.read()
    if (chunk) t.ok(/GET/.test(chunk.toString()))
  })

  ws.addLogging('common', { stream: stream })
  const server = ws.getServer()
  server.listen(8100, () => {
    request('http://localhost:8100/')
      .then(c.checkResponse(t, 404))
      .then(server.close.bind(server))
      .catch(c.fail(t))
  })
})
