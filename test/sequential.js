const Tom = require('test-runner').Tom
const fetch = require('node-fetch')
const LocalWebServer = require('../')
const WsCli = require('../lib/cli-app')
const a = require('assert')

const tom = module.exports = new Tom('sequential', { concurrency: 1 })

let origCwd = ''

tom.test('before', async function () {
  origCwd = process.cwd()
  process.chdir('test/fixture/middleware')
})

tom.test('cli: middleware named "index.js"', async function () {
  let logMsg = ''
  const cli = new WsCli({ log: function (msg) { logMsg = msg } })
  const lws = cli.start([ '--stack', 'index.js', '--config' ])
  a.ok(/TestMiddleware/.test(logMsg))
})

tom.test('basic', async function () {
  const port = 9100 + this.index
  const ws = LocalWebServer.create({
    port: port,
    stack: 'index.js'
  })
  ws.server.close()
  a.strictEqual(ws.stack[0].constructor.name, 'TestMiddleware')
})

tom.test('after', async function () {
  process.chdir(origCwd)
})
