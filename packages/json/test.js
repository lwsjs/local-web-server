import TestRunner from 'test-runner'
import Json from './index.js'
import Lws from 'lws'
import fetch from 'node-fetch'

const tom = new TestRunner.Tom()

tom.test('simple', async function () {
  const port = 8000 + this.index
  const lws = Lws.create({ port, stack: Json })
  const response = await fetch(`http://localhost:${port}/`)
  lws.server.close()
})

export default tom
