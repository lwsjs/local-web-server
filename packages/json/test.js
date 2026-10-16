const Tom = require('test-runner').Tom
const Json = require('./')
const Lws = require('lws')
const fetch = require('node-fetch')

const tom = module.exports = new Tom()

tom.test('simple', async function () {
  const port = 8000 + this.index
  const lws = Lws.create({ port, stack: Json })
  const response = await fetch(`http://localhost:${port}/`)
  lws.server.close()
})
