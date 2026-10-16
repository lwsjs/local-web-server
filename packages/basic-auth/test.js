const Tom = require('test-runner').Tom
const a = require('assert').strict
const fetch = require('node-fetch')
const Lws = require('lws')
const BasicAuth = require('./')

const tom = module.exports = new Tom()

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
