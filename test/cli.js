const Tom = require('test-runner').Tom
const a = require('assert')
const WsCli = require('../lib/cli-app')
const fetch = require('node-fetch')

const tom = module.exports = new Tom('cli')

tom.test('cli.run', async function () {
  const port = 7500 + this.index
  const origArgv = process.argv.slice()
  process.argv = [ 'node', 'something', '--port', `${port}` ]
  const cli = new WsCli({ logError: function () {} })
  const server = cli.start()
  process.argv = origArgv
  const response = await fetch(`http://127.0.0.1:${port}/package.json`)
  server.close()
  a.strictEqual(response.status, 200)
})

tom.test('cli.run: bad option', async function () {
  const origArgv = process.argv.slice()
  process.argv = [ 'node', 'something', '--should-fail' ]
  const exitCode = process.exitCode
  const cli = new WsCli({ logError: function () {} })
  const server = cli.start()
  if (!exitCode) process.exitCode = 0
  process.argv = origArgv
  a.strictEqual(server, undefined)
})

tom.test('cli.run: --help', async function () {
  const origArgv = process.argv.slice()
  process.argv = [ 'node', 'something', '--help' ]
  const cli = new WsCli({ log: function () {} })
  cli.start()
  process.argv = origArgv
})

tom.test('cli.run: --version', async function () {
  const origArgv = process.argv.slice()
  process.argv = [ 'node', 'something', '--version' ]
  let logMsg = ''
  const cli = new WsCli({ log: function (msg) { logMsg = msg } })
  cli.start()
  const pkg = require('../package.json')
  a.strictEqual(logMsg.trim(), pkg.version)
  process.argv = origArgv
})

tom.test('cli.run: default-stack', async function () {
  const origArgv = process.argv.slice()
  process.argv = [ 'node', 'something', '--default-stack' ]
  let logMsg = ''
  const cli = new WsCli({ log: function (msg) { logMsg = msg } })
  cli.start()
  a.ok(/lws-static/.test(logMsg))
  process.argv = origArgv
})
