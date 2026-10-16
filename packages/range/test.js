import TestRunner from 'test-runner'
import { strict as a } from 'assert'
import Range from 'lws-range'
import Lws from 'lws'
import fetch from 'node-fetch'

const tom = new TestRunner.Tom()

tom.test('simple', async function () {
  const port = 8000 + this.index
  const lws = await Lws.create({ port, stack: Range })
  const response = await fetch(`http://localhost:${port}/`)
  a.equal(response.headers.get('accept-ranges'), 'bytes')
  lws.server.close()
})

export default tom
