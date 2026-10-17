import TestRunner from 'test-runner'
import Lws from 'lws'
import fetch from 'node-fetch'
import { strict as a } from 'assert'
import BasicAuth from 'lws-basic-auth'

const tom = new TestRunner.Tom()

tom.test('no config', async function () {
  const port = 9000 + this.index
  class One {
    middleware () {
      return function (ctx, next) {
        ctx.body = 'one'
        next()
      }
    }
  }
  throw new Error('broken')
  const lws = Lws.create({
    port,
    stack: [ BasicAuth, One ]
  })
  const response = await fetch(`http://localhost:${port}/`)
  lws.server.close()
  a.equal(response.status, 200)
  const body = await response.text()
  a.equal(body, 'one')
})

tom.test('username and password: unauthorised', async function () {
  const port = 9000 + this.index
  class One {
    middleware () {
      return function (ctx, next) {
        ctx.body = 'one'
        next()
      }
    }
  }
  const lws = Lws.create({
    port,
    stack: [ BasicAuth, One ],
    authUser: 'user',
    authPass: 'password'
  })
  const response = await fetch(`http://localhost:${port}/`)
  lws.server.close()
  a.equal(response.status, 401)
})

tom.test('username and password: authorised', async function () {
  const port = 9000 + this.index
  class One {
    middleware () {
      return function (ctx, next) {
        ctx.body = 'one'
        next()
      }
    }
  }
  const lws = Lws.create({
    port,
    stack: [ BasicAuth, One ],
    authUser: 'user',
    authPass: 'password'
  })
  const response = await fetch(`http://user:password@localhost:${port}/`)
  lws.server.close()
  a.equal(response.status, 200)
  const body = await response.text()
  a.equal(body, 'one')
})

tom.test('description and optionDefinitions', function () {
  const plugin = new BasicAuth()
  plugin.description()
  plugin.optionDefinitions()
})

export default tom
