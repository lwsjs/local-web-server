import TestRunner from 'test-runner'
import assert from 'assert'
import Index from 'lws-index'
import Lws from 'lws'
import fetch from 'node-fetch'
const a = assert.strict

const tom = new TestRunner.Tom()

tom.test('no options', async function () {
  const port = 9000 + this.index
  const lws = await Lws.create({
    stack: Index,
    port: port
  })
  const response = await fetch(`http://localhost:${port}/`)
  const body = await response.text()
  lws.server.close()
  a.ok(/listing directory/.test(body))
  a.ok(/class="icon/.test(body))
})

tom.test('directory links have trailing slash', async function () {
  const port = 9000 + this.index
  const lws = await Lws.create({
    stack: Index,
    port: port
  })
  const response = await fetch(`http://localhost:${port}/`)
  const body = await response.text()
  lws.server.close()
  a.ok(/href="\/node_modules\/"/.test(body))
  a.ok(/href="\/index.js"/.test(body))
})

export default tom
