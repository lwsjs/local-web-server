const Tom = require('test-runner').Tom
const a = require('assert')
const CliApp = require('../lib/cli-app')
const fetch = require('node-fetch')

const tom = module.exports = new Tom('cli')

tom.test('cli.run', async function () {
  const port = 7500 + this.index
  const origArgv = process.argv.slice()
  process.argv = [ 'node', 'something', '--port', `${port}` ]
  const server = CliApp.run()
  process.argv = origArgv
  const response = await fetch(`http://127.0.0.1:${port}/`)
  server.close()
  a.strictEqual(response.status, 200)
})

tom.test('cli.run: bad option', async function () {
  const origArgv = process.argv.slice()
  process.argv = [ 'node', 'something', '--should-fail' ]
  const exitCode = process.exitCode
  const server = CliApp.run()
  if (!exitCode) process.exitCode = 0
  process.argv = origArgv
  a.strictEqual(server, undefined)
})

tom.test('cli.run: --help', async function () {
  const origArgv = process.argv.slice()
  process.argv = [ 'node', 'something', '--help' ]
  CliApp.run()
  process.argv = origArgv
})

tom.test('cli.run: --version', async function () {
  const origArgv = process.argv.slice()
  process.argv = [ 'node', 'something', '--version' ]
  CliApp.run()
  process.argv = origArgv
})

tom.test('cli.run: middleware-list', async function () {
  const origArgv = process.argv.slice()
  process.argv = [ 'node', 'something', 'middleware-list' ]
  CliApp.run()
  process.argv = origArgv
})
