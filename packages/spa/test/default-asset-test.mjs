import TestRunner from 'test-runner'
import assert from 'assert'
import fetch from 'node-fetch'
import Spa from 'lws-spa'
import Static from 'lws-static'
import Lws from 'lws'

const a = assert.strict
const tom = new TestRunner.Tom({ maxConcurrency: 1 })

let server
const port = 8010

tom.before('before default asset test', async function () {
  const lws = await Lws.create({
    port,
    stack: [Spa, Static],
    directory: 'test/fixture',
    spa: 'one.txt'
  })
  server = lws.server
})

tom.test('missing file redirects to spa', async function () {
  const headers = { accept: 'text/html' }
  const response = await fetch(`http://localhost:${port}/asdf`, { headers })
  a.strictEqual(response.status, 200)
  const body = await response.text()
  a.ok(/one/.test(body))
})

tom.test('/ returns spa', async function () {
  const headers = { accept: 'text/html' }
  const response = await fetch(`http://localhost:${port}/`, { headers })
  a.strictEqual(response.status, 200)
  const body = await response.text()
  a.ok(/one/.test(body))
})

tom.test('static asset without "." not found by default', async function () {
  const headers = { accept: 'text/html' }
  const response = await fetch(`http://localhost:${port}/three`, { headers })
  a.strictEqual(response.status, 200)
  const body = await response.text()
  a.ok(/one/.test(body))
})

tom.test('html requests for missing files with extensions do not redirect to spa', async function () {
  const headers = { accept: 'text/html' }
  const response = await fetch(`http://localhost:${port}/asdf.txt`, { headers })
  a.strictEqual(response.status, 404)
})

tom.test('existing static file', async function () {
  const response = await fetch(`http://localhost:${port}/two.txt`)
  a.strictEqual(response.status, 200)
  const body = await response.text()
  a.ok(/two/.test(body))
})

tom.test('not a text/html request - does not redirect to spa', async function () {
  const headers = { accept: 'application/json' }
  const response = await fetch(`http://localhost:${port}/asdf`, { headers })
  a.strictEqual(response.status, 404)
})

tom.test('existing static file with querystring', async function () {
  const response = await fetch(`http://localhost:${port}/two.txt?key=value`)
  a.strictEqual(response.status, 200)
  const body = await response.text()
  a.ok(/two/.test(body))
})

tom.test('existing static file with querystring containing fullstop', async function () {
  const response = await fetch(`http://localhost:${port}/two.txt?key=value.txt`)
  a.strictEqual(response.status, 200)
  const body = await response.text()
  a.ok(/two/.test(body))
})

tom.test('route with querystring, redirects to spa', async function () {
  const response = await fetch(`http://localhost:${port}/login?key=value`)
  a.strictEqual(response.status, 200)
  const body = await response.text()
  a.ok(/one/.test(body))
})

tom.test('route with querystring containing fullstop, redirects to spa', async function () {
  const response = await fetch(`http://localhost:${port}/login?key=value.txt`)
  a.strictEqual(response.status, 200)
  const body = await response.text()
  a.ok(/one/.test(body))
})

tom.after('after default asset test', function () {
  server.close()
})

export default tom
