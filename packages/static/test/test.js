import TestRunner from 'test-runner'
import assert from 'assert'
import Static from 'lws-static'
import Lws from 'lws'
import fetch from 'node-fetch'

const a = assert.strict
const tom = new TestRunner.Tom()

tom.test('simple', async function () {
  const port = 8000 + this.index
  const lws = await Lws.create({
    port,
    stack: [Static],
    directory: 'test/fixture'
  })
  const response = await fetch(`http://localhost:${port}/one.html`)
  const body = await response.text()
  a.strictEqual(body, 'one\n')
  lws.server.close()
})

tom.test('default extension', async function () {
  const port = 8000 + this.index
  const lws = await Lws.create({
    port,
    stack: [Static],
    directory: 'test/fixture',
    staticExtensions: ['html']
  })
  const response = await fetch(`http://localhost:${port}/one`)
  const body = await response.text()
  a.strictEqual(body, 'one\n')
  lws.server.close()
})

tom.test('static extensions supports a single value', async function () {
  const port = 8000 + this.index
  const lws = await Lws.create({
    port,
    stack: [Static],
    directory: 'test/fixture',
    staticExtensions: 'html'
  })
  const response = await fetch(`http://localhost:${port}/one`)
  const body = await response.text()
  a.strictEqual(body, 'one\n')
  lws.server.close()
})

export default tom
