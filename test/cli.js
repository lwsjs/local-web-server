const Tom = require('test-runner').Tom
const a = require('assert')
const WsCli = require('../lib/cli-app')
const fetch = require('node-fetch')

const tom = module.exports = new Tom('cli', { concurrency: 1 })

tom.test('simple', async function () {
  const port = 7500 + this.index
  const cli = new WsCli({ logError: function () {} })
  const server = cli.start([ '--port', `${port}` ])
  const response = await fetch(`http://127.0.0.1:${port}/package.json`)
  server.close()
  a.strictEqual(response.status, 200)
})

tom.test('bad option', async function () {
  const exitCode = process.exitCode
  const cli = new WsCli({ logError: function () {} })
  const server = cli.start([ '--should-fail' ])
  if (!exitCode) process.exitCode = 0
  a.strictEqual(server, undefined)
})

tom.test('--help', async function () {
  const cli = new WsCli({ log: function () {} })
  cli.start([ '--help' ])
})

tom.test('--version', async function () {
  let logMsg = ''
  const cli = new WsCli({ log: function (msg) { logMsg = msg } })
  cli.start([ '--version' ])
  const pkg = require('../package.json')
  a.strictEqual(logMsg.trim(), pkg.version)
})

tom.test('default-stack', async function () {
  let logMsg = ''
  const cli = new WsCli({ log: function (msg) { logMsg = msg } })
  cli.start([ '--default-stack' ])
  a.ok(/lws-static/.test(logMsg))
})
