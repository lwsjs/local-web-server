const Tom = require('test-runner').Tom
const Mime = require('./')
const Lws = require('lws')
const fetch = require('node-fetch')
const a = require('assert')

const tom = module.exports = new Tom()

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
