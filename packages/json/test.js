import TestRunner from 'test-runner'
import Json from './index.js'
import Lws from 'lws'

const tom = new TestRunner.Tom()

tom.test('simple', async function () {
  const port = 8000 + this.index
  const lws = await Lws.create({ port, stack: Json })
  const response = await fetch(`http://localhost:${port}/`)
  lws.server.close()
})

export default tom
