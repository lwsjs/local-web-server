import TestRunner from 'test-runner'
import Blacklist from 'lws-blacklist'
import Lws from 'lws'
import fetch from 'node-fetch'
import { strict as a } from 'assert'

const tom = new TestRunner.Tom()

tom.test('simple', async function () {
  const port = 8000 + this.index
  const lws = await Lws.create({
    port,
    stack: Blacklist,
    blacklist: /\/one/
  })
  try {
    const response = await fetch(`http://localhost:${port}/one`)
    const response2 = await fetch(`http://localhost:${port}/two`)
    a.equal(response.status, 403)
    a.equal(response2.status, 404)
  } catch (err) {
    throw err
  } finally {
    lws.server.close()
  }
})

tom.test('wildcard', async function () {
  const port = 8000 + this.index
  const lws = await Lws.create({
    port,
    stack: Blacklist,
    blacklist: /.*\.php$/
  })

  try {
    const response = await fetch(`http://localhost:${port}/one.php`)
    const response2 = await fetch(`http://localhost:${port}/two`)
    a.equal(response.status, 403)
    a.equal(response2.status, 404)
  } catch (err) {
    throw err
  } finally {
    lws.server.close()
  }
})

tom.test('string expression', async function () {
  const port = 8000 + this.index
  const lws = await Lws.create({
    port,
    stack: Blacklist,
    blacklist: '.*\\.php$'
  })

  try {
    const response = await fetch(`http://localhost:${port}/one.php`)
    const response2 = await fetch(`http://localhost:${port}/two/php/something.html`)
    a.equal(response.status, 403)
    a.equal(response2.status, 404)
  } catch (err) {
    throw err
  } finally {
    lws.server.close()
  }
})

export default tom
