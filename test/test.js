'use strict'
const TestRunner = require('test-runner')
const request = require('req-then')
const LocalWebServer = require('../')
const a = require('assert')

const runner = new TestRunner()

runner.test('basic', async function () {
  const port = 9000 + this.index
  const localWebServer = new LocalWebServer()
  const server = localWebServer.create({
    port: port,
    directory: 'test/fixture'
  })
  const response = await request(`http://localhost:${port}/one.txt`)
  server.close()
  a.strictEqual(response.data.toString(), 'one\n')
})
