import TestRunner from 'test-runner'
import Compress from 'lws-compress'
import Lws from 'lws'
import fetch from 'node-fetch'
import { strict as a } from 'assert'
import { promises as fs } from 'fs'

const tom = new TestRunner.Tom()

tom.test('gzip', async function () {
  const port = 8000 + this.index
  class One {
    middleware (options) {
      return async function (ctx, next) {
        ctx.body = await fs.readFile('test/big-file.txt', 'utf8')
        await next()
      }
    }
  }
  const lws = await Lws.create({
    port,
    stack: [ One, Compress ],
    compress: true
  })
  const response = await fetch(`http://localhost:${port}/`, {
    headers: {
      'Accept-Encoding': 'gzip'
    }
  })
  lws.server.close()
  a.equal(response.headers.get('vary'), 'Accept-Encoding')
  a.deepEqual(response.headers.get('content-encoding'), 'gzip')
})

tom.test('br', async function () {
  const port = 8000 + this.index
  class One {
    middleware (options) {
      return async function (ctx, next) {
        ctx.body = await fs.readFile('test/big-file.txt', 'utf8')
        await next()
      }
    }
  }
  const lws = await Lws.create({
    port,
    stack: [ One, Compress ],
    compress: true
  })

  const response = await fetch(`http://localhost:${port}/`, {
    headers: {
      'Accept-Encoding': 'br'
    }
  })
  lws.server.close()
  a.equal(response.headers.get('vary'), 'Accept-Encoding')
  a.deepEqual(response.headers.get('content-encoding'), 'br')
})

export default tom
