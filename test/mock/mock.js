'use strict'
const test = require('tape')
const request = require('req-then')
const LocalWebServer = require('../../')
const c = require('../common')

test('mock: simple response', function (t) {
  t.plan(2)
  const ws = new LocalWebServer()
  ws.addMockResponses([
    { route: '/test', response: { body: 'test' } }
  ])
  const server = ws.getServer()
  server.listen(8100, () => {
    request('http://localhost:8100/test')
      .then(c.checkResponse(t, 200, /test/))
      .then(server.close.bind(server))
      .catch(c.fail(t))
  })
})

test('mock: method request filter', function (t) {
  t.plan(3)
  const ws = new LocalWebServer()
  ws.addMockResponses([
    {
      route: '/test',
      request: { method: 'POST' },
      response: { body: 'test' }
    }
  ])
  const server = ws.getServer()
  server.listen(8100, () => {
    request('http://localhost:8100/test')
      .then(c.checkResponse(t, 404))
      .then(() => request('http://localhost:8100/test', { data: 'something' }))
      .then(c.checkResponse(t, 200, /test/))
      .then(server.close.bind(server))
      .catch(c.fail(t))
  })
})

test('mock: accepts request filter', function (t) {
  t.plan(3)
  const ws = new LocalWebServer()
  ws.addMockResponses([
    {
      route: '/test',
      request: { accepts: 'text' },
      response: { body: 'test' }
    }
  ])
  const server = ws.getServer()
  server.listen(8100, () => {
    request('http://localhost:8100/test', { headers: { Accept: '*/json' } })
      .then(c.checkResponse(t, 404))
      .then(() => request('http://localhost:8100/test', { headers: { Accept: 'text/plain' } }))
      .then(c.checkResponse(t, 200, /test/))
      .then(server.close.bind(server))
  })
})

test('mock: responses array', function (t) {
  t.plan(4)
  const ws = new LocalWebServer()
  ws.addMockResponses([
    {
      route: '/test',
      responses: [
        { request: { method: 'GET' }, response: { body: 'get' } },
        { request: { method: 'POST' }, response: { body: 'post' } }
      ]
    }
  ])
  const server = ws.getServer()
  server.listen(8100, () => {
    request('http://localhost:8100/test')
      .then(c.checkResponse(t, 200, /get/))
      .then(() => request('http://localhost:8100/test', { method: 'POST' }))
      .then(c.checkResponse(t, 200, /post/))
      .then(server.close.bind(server))
  })
})

test('mock: response function', function (t) {
  t.plan(4)
  const ws = new LocalWebServer()
  ws.addMockResponses([
    {
      route: '/test',
      responses: [
        { request: { method: 'GET' }, response: ctx => ctx.body = 'get' },
        { request: { method: 'POST' }, response: ctx => ctx.body = 'post' }
      ]
    }
  ])
  const server = ws.getServer()
  server.listen(8100, () => {
    request('http://localhost:8100/test')
      .then(c.checkResponse(t, 200, /get/))
      .then(() => request('http://localhost:8100/test', { method: 'POST' }))
      .then(c.checkResponse(t, 200, /post/))
      .then(server.close.bind(server))
  })
})

test('mock: response function args', function (t) {
  t.plan(2)
  const ws = new LocalWebServer()
  ws.addMockResponses([
    {
      route: '/test/:one',
      responses: [
        { request: { method: 'GET' }, response: (ctx, one) => ctx.body = one }
      ]
    }
  ])
  const server = ws.getServer()
  server.listen(8100, () => {
    request('http://localhost:8100/test/yeah')
      .then(c.checkResponse(t, 200, /yeah/))
      .then(server.close.bind(server))
  })
})

test('mock: async response function', function (t) {
  t.plan(2)
  const ws = new LocalWebServer()
  ws.addMockResponses([
    {
      route: '/test',
      responses: {
        response: function (ctx) {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              ctx.body = 'test'
              resolve()
            }, 10)
          })
        }
      }
    }
  ])
  const server = ws.getServer()
  server.listen(8100, () => {
    request('http://localhost:8100/test')
      .then(c.checkResponse(t, 200, /test/))
      .then(server.close.bind(server))
  })
})
