const Tom = require('test-runner').Tom
const RequestMonitor = require('./')
const Lws = require('lws')
const fetch = require('node-fetch')
const a = require('assert').strict
const LwsBodyParser = require('lws-body-parser')

const tom = module.exports = new Tom('request-monitor')

tom.test('GET', async function () {
  const port = 8000 + this.index
  const actuals = []
  const lws = Lws.create({ port, stack: [ LwsBodyParser, RequestMonitor] })
  lws.on('verbose', (key, value) => {
    if (key === 'server.request' || key === 'server.response') {
      actuals.push(key)
    }
  })
  const response = await fetch(`http://localhost:${port}/`)
  lws.server.close()
  a.deepEqual(actuals, [ 'server.request', 'server.response' ])
})

tom.test('POST with form body', async function () {
  const port = 8000 + this.index
  const actuals = []
  const lws = Lws.create({ port, stack: [ LwsBodyParser, RequestMonitor] })
  lws.on('verbose', (key, value) => {
    if (key === 'server.request' || key === 'server.response') {
      actuals.push(key)
    }
  })
  const response = await fetch(`http://localhost:${port}/`, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    body: 'one=1'
  })
  lws.server.close()
  a.deepEqual(actuals, [ 'server.request', 'server.response' ])
  // check the `reqInfo` emitted contains the request body
})

tom.test('POST with json body', async function () {
  const port = 8000 + this.index
  const actuals = []
  const lws = Lws.create({ port, stack: [ LwsBodyParser, RequestMonitor] })
  lws.on('verbose', (key, value) => {
    if (key === 'server.request' || key === 'server.response') {
      actuals.push(key)
    }
  })
  const response = await fetch(`http://localhost:${port}/`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({ one: 1 })
  })
  lws.server.close()
  a.deepEqual(actuals, [ 'server.request', 'server.response' ])
})
