const Tom = require('test-runner').Tom
const fetch = require('node-fetch')
const LocalWebServer = require('../')
const a = require('assert').strict

const tom = module.exports = new Tom()

tom.test('basic', async function () {
  const port = 9000 + this.index
  const ws = LocalWebServer.create({
    port: port,
    directory: 'test/fixture'
  })
  const response = await fetch(`http://localhost:${port}/one.txt`)
  ws.server.close()
  const body = await response.text()
  a.equal(body, 'one\n')
})
