const Tom = require('test-runner').Tom
const fetch = require('node-fetch')
const LocalWebServer = require('../')
const a = require('assert')

const tom = module.exports = new Tom('test')

tom.test('basic', async function () {
  const port = 9000 + this.index
  const localWebServer = new LocalWebServer()
  const server = localWebServer.listen({
    port: port,
    directory: 'test/fixture'
  })
  const response = await fetch(`http://localhost:${port}/one.txt`)
  server.close()
  const body = await response.text()
  a.strictEqual(body, 'one\n')
})
