import TestRunner from 'test-runner'
import BodyParser from 'lws-body-parser'
import Lws from 'lws'
import { strict as a } from 'assert'
import fetch from 'node-fetch'

const tom = new TestRunner.Tom()

tom.test('middleware correctly receives a parsed json object', async function () {
  const actuals = []
  const port = 8000 + this.index
  class One {
    middleware (options) {
      return function (ctx, next) {
        actuals.push(ctx.request.body.one)
      }
    }
  }
  const lws = await Lws.create({
    port,
    stack: [BodyParser, One]
  })
  const response = await fetch(`http://localhost:${port}/`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({ one: 'one' })
  })
  lws.server.close()
  a.deepEqual(actuals, ['one'])
})

export default tom
