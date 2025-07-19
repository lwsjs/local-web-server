import TestRunner from 'test-runner'
import fetch from 'node-fetch'
import LocalWebServer from 'local-web-server'
import assert from 'assert'

const a = assert.strict
const tom = new TestRunner.Tom()

tom.test('basic', async function () {
  const port = 9000 + this.index
  const ws = await LocalWebServer.create({
    port,
    directory: 'test/fixture'
  })
  const response = await fetch(`http://localhost:${port}/one.txt`)
  ws.server.close()
  const body = await response.text()
  a.equal(body, 'one\n')
})

export default tom
