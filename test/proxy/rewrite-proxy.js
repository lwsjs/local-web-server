'use strict'
const test = require('tape')
const request = require('req-then')
const LocalWebServer = require('../../')
const http = require('http')

function checkResponse (t, status, body) {
  return function (response) {
    if (status) t.strictEqual(response.res.statusCode, status)
    if (body) t.ok(body.test(response.data), 'correct data')
  }
}

function fail (t) {
  return function (err) {
    t.fail('failed: ' + err.stack)
  }
}

test('rewrite: proxy', function (t) {
  t.plan(2)
  const ws = new LocalWebServer()
  ws.addRewrite([
    { from: '/test/*', to: 'http://registry.npmjs.org/$1' }
  ])
  const server = ws.getServer()
  server.listen(8100, () => {
    request('http://localhost:8100/test/')
      .then(checkResponse(t, 200, /db_name/))
      .then(server.close.bind(server))
      .catch(fail(t))
  })
})

test('rewrite: proxy, POST', function (t) {
  t.plan(1)
  const ws = new LocalWebServer()
  ws.addRewrite([
    { from: '/test/*', to: 'http://registry.npmjs.org/' }
  ])
  const server = ws.getServer()
  server.listen(8100, () => {
    request('http://localhost:8100/test/', { data: {} })
      .then(checkResponse(t, 405))
      .then(server.close.bind(server))
      .catch(fail(t))
  })
})

test('rewrite: proxy, two url tokens', function (t) {
  t.plan(2)
  const ws = new LocalWebServer()
  ws.addRewrite([
    { from: '/:package/:version', to: 'http://registry.npmjs.org/:package/:version' }
  ])
  const server = ws.getServer()
  server.listen(8100, () => {
    request('http://localhost:8100/command-line-args/1.0.0')
      .then(checkResponse(t, 200, /command-line-args/))
      .then(server.close.bind(server))
      .catch(fail(t))
  })
})

test('rewrite: proxy with port', function (t) {
  t.plan(2)
  const ws1 = new LocalWebServer()
  ws1.addStatic(__dirname)

  const ws2 = new LocalWebServer()
  ws2.addRewrite([
    { from: '/test/*', to: 'http://localhost:9000/$1' }
  ])
  const server1 = ws1.getServer()
  const server2 = ws2.getServer()
  server1.listen(9000, () => {
    server2.listen(8100, () => {
      request('http://localhost:8100/test/file.txt')
        .then(checkResponse(t, 200, /one/))
        .then(server1.close.bind(server1))
        .then(server2.close.bind(server2))
    })
  })
})
