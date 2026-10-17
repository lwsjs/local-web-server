import TestRunner from 'test-runner'
import Mime from './index.js'
import Lws from 'lws'
import fetch from 'node-fetch'
import a from 'assert'

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
  const lws = Lws.create({
    port,
    stack: [ Mime, One ],
    mime: {
      'text/yeah': [ 'txt' ]
    }
  })
  const response = await fetch(`http://localhost:${port}/one.txt`)
  lws.server.close()
  a.ok(/yeah/.test(response.headers.get('content-type')))
})

export default tom
