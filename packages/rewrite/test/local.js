import { strict as a } from 'assert'
import TestRunner from 'test-runner'
import Rewrite from 'lws-rewrite'
import Static from 'lws-static'
import ErrDetail from 'lws-err-detail'
import Lws from 'lws'
import fetch from 'node-fetch'

const tom = new TestRunner.Tom()

tom.test('simple', async function () {
  const port = 8050 + this.index
  const lws = await Lws.create({
    port,
    stack: [ErrDetail, Rewrite, Static],
    directory: 'test/fixture',
    rewrite: { from: '/two.html', to: '/one.html' }
  })
  const response = await fetch(`http://localhost:${port}/two.html`)
  const body = await response.text()
  try {
    a.strictEqual(body, 'one\n')
  } finally {
    lws.server.close()
  }
})

tom.test('no match', async function () {
  const port = 8050 + this.index
  const lws = await Lws.create({
    port,
    stack: [ErrDetail, Rewrite, Static],
    directory: 'test/fixture',
    rewrite: { from: '/aaa.html', to: '/bbb.html' }
  })
  const response = await fetch(`http://localhost:${port}/one.html`)
  const body = await response.text()
  try {
    a.strictEqual(body, 'one\n')
  } finally {
    lws.server.close()
  }
})

tom.test('simple, using tokens', async function () {
  const port = 8050 + this.index
  const lws = await Lws.create({
    port,
    stack: [ErrDetail, Rewrite, Static],
    directory: 'test/fixture',
    rewrite: { from: '/page/:id', to: '/:id.html' }
  })
  const response = await fetch(`http://localhost:${port}/page/one`)
  const body = await response.text()
  try {
    a.strictEqual(body, 'one\n')
  } finally {
    lws.server.close()
  }
})

tom.test('wildcard parameter', async function () {
  const port = 8050 + this.index
  const lws = await Lws.create({
    port,
    stack: [ErrDetail, Rewrite, Static],
    directory: 'test/fixture',
    rewrite: { from: '/(.*)', to: '/$1.html' }
  })
  const response = await fetch(`http://localhost:${port}/one`)
  const body = await response.text()
  try {
    a.strictEqual(body, 'one\n')
  } finally {
    lws.server.close()
  }
})

export default tom
