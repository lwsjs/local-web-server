'use strict'
const test = require('tape')
const request = require('req-then')
const LocalWebServer = require('../../')
const c = require('../common')

test('spa', function (t) {
  t.plan(6)
  const ws = new LocalWebServer()
  ws.addSpa('one.txt')
  ws.addStatic(__dirname)
  const server = ws.getServer()
  server.listen(8100, () => {
    request('http://localhost:8100/asdf', { headers: { accept: 'text/html' } })
      .then(c.checkResponse(t, 200, /one/))
      /* html requests for missing files with extensions do not redirect to spa */
      .then(() => request('http://localhost:8100/asdf.txt', { headers: { accept: 'text/html' } }))
      .then(c.checkResponse(t, 404))
      /* existing static file */
      .then(() => request('http://localhost:8100/two.txt'))
      .then(c.checkResponse(t, 200, /two/))
      /* not a text/html request - does not redirect to spa */
      .then(() => request('http://localhost:8100/asdf', { headers: { accept: 'application/json' } }))
      .then(c.checkResponse(t, 404))
      .then(server.close.bind(server))
      .catch(c.fail(t))
  })
})
