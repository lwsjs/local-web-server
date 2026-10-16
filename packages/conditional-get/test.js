import TestRunner from 'test-runner'
import ConditionalGet from 'lws-conditional-get'
import Lws from 'lws'
import url from 'url'
import fetch from 'node-fetch'
import { strict as a } from 'assert'

const tom = new TestRunner.Tom()

tom.test('simple', async function () {
  const port = 8000 + this.index
  class One {
    middleware () {
      return function (ctx) {
        ctx.body = 'one'
      }
    }
  }
  const lws = await Lws.create({
    port,
    stack: [ ConditionalGet, One ]
  })
  const response = await fetch(`http://localhost:${port}/`)
  const etag = response.headers.get('etag')
  const response2 = await fetch(`http://localhost:${port}/`, {
    headers: {
      'If-None-Match': etag
    }
  })
  lws.server.close()
  a.equal(response.status, 200)
  a.equal(response2.status, 304)
})

tom.test('disabled', async function () {
  const port = 8000 + this.index
  class One {
    middleware () {
      return function (ctx) {
        ctx.body = 'one'
      }
    }
  }
  const lws = await Lws.create({
    port,
    stack: [ ConditionalGet, One ],
    noConditionalGet: true
  })
  const response = await fetch(`http://localhost:${port}/`)
  lws.server.close()
  a.equal(response.status, 200)
  a.equal(response.headers.get('etag'), null)
})

export default tom
