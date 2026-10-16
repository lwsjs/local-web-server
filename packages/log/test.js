import TestRunner from 'test-runner'
import Log from 'lws-log'
import Lws from 'lws'
import fetch from 'node-fetch'
import { strict as a } from 'assert'

const tom = new TestRunner.Tom()

tom.test('simple', async function () {
  const port = 8000 + this.index
  const lws = await Lws.create({ port, stack: Log, logFormat: 'combined' })
  const response = await fetch(`http://localhost:${port}/`)
  lws.server.close()
})

export default tom
