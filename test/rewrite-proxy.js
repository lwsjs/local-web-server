'use strict'
const test = require('tape')
const request = require('req-then')
const localWebServer = require('../')
const http = require('http')

function launchServer (app, options) {
  options = options || {}
  const path = `http://localhost:8100${options.path || '/'}`
  const server = http.createServer(app.callback())
  return server.listen(options.port || 8100, () => {
    const req = request(path, options.reqOptions)
    if (options.onSuccess) req.then(options.onSuccess)
    if (!options.leaveOpen) req.then(() => server.close())
    req.catch(err => console.error('LAUNCH ERROR', err.stack))
  })
}

function checkResponse (t, status, body) {
  return function (response) {
    if (status) t.strictEqual(response.res.statusCode, status)
    if (body) t.ok(body.test(response.data))
  }
}

test('rewrite: proxy', function (t) {
  t.plan(2)
  const app = localWebServer({
    log: { format: 'none' },
    static: { root: __dirname + '/fixture/rewrite' },
    rewrite: [ { from: '/test/*', to: 'http://registry.npmjs.org/$1' } ]
  })
  launchServer(app, { path: '/test/', onSuccess: response => {
    t.strictEqual(response.res.statusCode, 200)
    t.ok(/db_name/.test(response.data))
  }})
})

test('rewrite: proxy, POST', function (t) {
  t.plan(1)
  const app = localWebServer({
    log: { format: 'none' },
    static: { root: __dirname + '/fixture/rewrite' },
    rewrite: [ { from: '/test/*', to: 'http://registry.npmjs.org/' } ]
  })
  const server = http.createServer(app.callback())
  server.listen(8100, () => {
    request('http://localhost:8100/test/', { data: {} })
      .then(checkResponse(t, 405))
      .then(server.close.bind(server))
  })
})

test('rewrite: proxy, two url tokens', function (t) {
  t.plan(2)
  const app = localWebServer({
    log: { format: 'none' },
    rewrite: [ { from: '/:package/:version', to: 'http://registry.npmjs.org/:package/:version' } ]
  })
  launchServer(app, { path: '/command-line-args/1.0.0', onSuccess: response => {
    t.strictEqual(response.res.statusCode, 200)
    t.ok(/command-line-args/.test(response.data))
  }})
})

test('rewrite: proxy with port', function (t) {
  t.plan(2)
  const one = localWebServer({
    log: { format: 'none' },
    static: { root: __dirname + '/fixture/one' }
  })
  const two = localWebServer({
    log: { format: 'none' },
    static: { root: __dirname + '/fixture/spa' },
    rewrite: [ { from: '/test/*', to: 'http://localhost:9000/$1' } ]
  })
  const server1 = http.createServer(one.callback())
  const server2 = http.createServer(two.callback())
  server1.listen(9000, () => {
    server2.listen(8100, () => {
      request('http://localhost:8100/test/file.txt').then(response => {
        t.strictEqual(response.res.statusCode, 200)
        t.ok(/one/.test(response.data))
        server1.close()
        server2.close()
      })
    })
  })
})
