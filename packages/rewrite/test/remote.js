import TestRunner from 'test-runner'
import Rewrite from 'lws-rewrite'
import Static from 'lws-static'
import Lws from 'lws'
import a from 'assert'
import http2 from 'http2'
import lwsErrDetail from 'lws-err-detail'
import net from 'net'

const tom = new TestRunner.Tom()

async function fetchHttp2 (host, path, reqHeaders) {
  return new Promise((resolve, reject) => {
    const client = http2.connect(host, {
      rejectUnauthorized: false
    })
    client.on('error', reject)

    const req = client.request(Object.assign({ ':path': path }, reqHeaders))

    let headers = {}
    req.on('response', (hdrs, flags) => {
      headers = hdrs
    })

    req.setEncoding('utf8')
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      client.close()
      resolve({ headers, body })
    })
    req.end()
  })
}

tom.test('GET', async function () {
  const port = 8100 + this.index
  const lws = await Lws.create({
    port,
    stack: [Rewrite, Static],
    rewrite: { from: '/json/:name/:id', to: 'http://jsonplaceholder.typicode.com/posts/:id' }
  })
  try {
    const response = await fetch(`http://localhost:${port}/json/lloyd/1`)
    a.strictEqual(response.status, 200)
    const body = await response.json()
    a.strictEqual(body.id, 1)
  } finally {
    lws.server.close()
  }
}, { timeout: 120000 })

tom.test('GET HTTPS', async function () {
  const port = 8100 + this.index
  const lws = await Lws.create({
    port,
    stack: [Rewrite, Static],
    rewrite: { from: '/json/:name/:id', to: 'https://jsonplaceholder.typicode.com/posts/:id' }
  })
  try {
    const response = await fetch(`http://localhost:${port}/json/lloyd/1`)
    a.strictEqual(response.status, 200)
    const body = await response.json()
    a.strictEqual(body.id, 1)
  } finally {
    lws.server.close()
  }
}, { timeout: 120000 })

tom.test('POST', async function () {
  const port = 8100 + this.index
  const lws = await Lws.create({
    port,
    stack: [Rewrite, Static],
    rewrite: { from: '/api/posts', to: 'https://jsonplaceholder.typicode.com/posts' }
  })
  try {
    const response = await fetch(`http://localhost:${port}/api/posts`, {
      method: 'POST',
      body: JSON.stringify({
        title: 'title',
        body: 'body',
        userId: 1
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8'
      }
    })
    a.strictEqual(response.status, 201)
    const body = await response.json()
    a.strictEqual(body.title, 'title')
    a.strictEqual(body.body, 'body')
  } finally {
    lws.server.close()
  }
}, { timeout: 120000 })

tom.test('POST with body-parser', async function () {
  const port = 8100 + this.index
  const lws = await Lws.create({
    port,
    stack: ['lws-body-parser', Rewrite, Static],
    rewrite: { from: '/api/posts', to: 'https://jsonplaceholder.typicode.com/posts' }
  })
  try {
    const response = await fetch(`http://localhost:${port}/api/posts`, {
      method: 'POST',
      body: JSON.stringify({
        title: 'title',
        body: 'body',
        userId: 1
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8'
      }
    })
    a.strictEqual(response.status, 201)
    const body = await response.json()
    a.strictEqual(body.title, 'title')
    a.strictEqual(body.body, 'body')
  } finally {
    lws.server.close()
  }
}, { timeout: 120000 })

tom.test('GET http2', async function () {
  const port = 8100 + this.index
  const lws = await Lws.create({
    port,
    stack: [Rewrite, Static],
    rewrite: { from: '/json/:name/:id', to: 'https://jsonplaceholder.typicode.com/posts/:id' },
    http2: true
  })
  try {
    const response = await fetchHttp2(`https://localhost:${port}`, '/json/lloyd/1')
    a.strictEqual(response.headers[':status'], 200)
    a.strictEqual(JSON.parse(response.body).id, 1)
  } finally {
    lws.server.close()
  }
}, { timeout: 120000 })

tom.skip('GET HTTP2 npm, transfer-encoding', async function () {
  const port = 8100 + this.index
  const lws = await Lws.create({
    port,
    stack: [Rewrite, Static],
    rewrite: { from: '/npm/(.*)', to: 'http://registry.npmjs.org/$1' },
    http2: true
  })
  try {
    const response = await fetchHttp2(`https://localhost:${port}`, '/npm/local-web-server', {
      'transfer-encoding': 'chunked'
    })
    a.strictEqual(response.headers[':status'], 200)
    a.strictEqual(JSON.parse(response.body).name, 'local-web-server')
  } finally {
    lws.server.close()
  }
}, { timeout: 120000 })

tom.test('target host does not exist', async function () {
  const port = 8100 + this.index
  const lws = await Lws.create({
    port,
    stack: [lwsErrDetail, Rewrite, Static],
    rewrite: { from: '/', to: 'http://a.broken.target.ooooooo.net' }
  })
  try {
    const response = await fetch(`http://localhost:${port}/`)
    const body = await response.text()
    a.strictEqual(response.status, 500)
    a.ok(/ENOTFOUND/.test(body) || /EAI_AGAIN/.test(body))
  } finally {
    lws.server.close()
  }
}, { timeout: 120000 })

tom.test('404 GET', async function () {
  const port = 8100 + this.index
  const lws = await Lws.create({
    port,
    stack: [Rewrite, Static],
    rewrite: { from: '/(.*)', to: 'http://jsonplaceholder.typicode.com/$1' }
  })
  try {
    const response = await fetch(`http://localhost:${port}/broken`)
    a.strictEqual(response.status, 404)
  } finally {
    lws.server.close()
  }
}, { timeout: 120000 })

tom.test('server connection reset', async function () {
  const remoteServer = net.createServer(socket => {
    socket.end()
  })
  remoteServer.listen({ port: 8200 })

  const port = 8100 + this.index
  const lws = await Lws.create({
    port,
    stack: [lwsErrDetail, Rewrite, Static],
    rewrite: { from: '/(.*)', to: 'http://localhost:8200/$1' }
  })
  try {
    const response = await fetch(`http://localhost:${port}/package.json`)
    a.strictEqual(response.status, 500)
    const body = await response.text()
    a.ok(/socket hang up/.test(body))
  } finally {
    lws.server.close()
    remoteServer.close()
  }
}, { timeout: 120000 })

tom.test('GET HTTPS, self-signed', async function () {
  const remoteLws = await Lws.create({
    port: 10000,
    https: true,
    stack: [Static]
  })

  const port = 8100 + this.index
  const lws = await Lws.create({
    port,
    stack: [Rewrite, Static],
    rewrite: { from: '/(.*)', to: 'https://localhost:10000/$1' }
  })
  try {
    const response = await fetch(`http://localhost:${port}/package.json`)
    a.strictEqual(response.status, 200)
    const body = await response.json()
    a.strictEqual(body.name, 'lws-rewrite')
  } finally {
    lws.server.close()
    remoteLws.server.close()
  }
}, { timeout: 120000 })

tom.test('GET HTTPS, secure cookie attribute set - remove it', async function () {
  class SecureCookie {
    middleware (config, lws) {
      return function (ctx, next) {
        const secure = true
        ctx.cookies.set('test', 'one', { secure })
        ctx.body = 'test'
      }
    }
  }
  const remotePort = 10000 + this.index
  const remoteLws = await Lws.create({
    port: remotePort,
    https: true,
    stack: [SecureCookie]
  })

  const port = 8100 + this.index
  const lws = await Lws.create({
    port,
    stack: [Rewrite, Static],
    rewrite: { from: '/', to: `https://localhost:${remotePort}/` }
  })
  try {
    const response = await fetch(`http://localhost:${port}/`)
    a.strictEqual(response.status, 200)
    a.strictEqual(response.headers.get('set-cookie'), 'test=one; path=/; httponly')
  } finally {
    lws.server.close()
    remoteLws.server.close()
  }
}, { timeout: 120000 })

tom.test('GET HTTPS, `secure` and `SameSite=none` attributes set - remove them both', async function () {
  class SecureCookie {
    middleware (config, lws) {
      return function (ctx, next) {
        const secure = true
        ctx.cookies.set('test', 'one', { secure, sameSite: 'none' })
        ctx.body = 'test'
      }
    }
  }
  const remotePort = 10000 + this.index
  const remoteLws = await Lws.create({
    port: remotePort,
    https: true,
    stack: [SecureCookie]
  })

  const port = 8100 + this.index
  const lws = await Lws.create({
    port,
    stack: [Rewrite, Static],
    rewrite: { from: '/', to: `https://localhost:${remotePort}/` }
  })
  try {
    const response = await fetch(`http://localhost:${port}/`)
    a.strictEqual(response.status, 200)
    a.strictEqual(response.headers.get('set-cookie'), 'test=one; path=/; httponly')
  } finally {
    lws.server.close()
    remoteLws.server.close()
  }
}, { timeout: 120000 })

tom.test('GET HTTPS, --rewrite.keep-secure-attr', async function () {
  class SecureCookie {
    middleware (config, lws) {
      return function (ctx, next) {
        const secure = true
        ctx.cookies.set('test', 'one', { secure })
        ctx.body = 'test'
      }
    }
  }
  const remotePort = 10000 + this.index
  const remoteLws = await Lws.create({
    port: remotePort,
    https: true,
    stack: [SecureCookie]
  })

  const port = 8100 + this.index
  const lws = await Lws.create({
    port,
    stack: [Rewrite, Static],
    rewrite: { from: '/', to: `https://localhost:${remotePort}/` },
    rewriteKeepSecureAttr: true
  })
  try {
    const response = await fetch(`http://localhost:${port}/`)
    a.strictEqual(response.status, 200)
    a.strictEqual(response.headers.get('set-cookie'), 'test=one; path=/; secure; httponly')
  } finally {
    lws.server.close()
    remoteLws.server.close()
  }
}, { timeout: 120000 })

tom.test('GET HTTPS, --rewrite.keep-secure-attr, multiple cookies', async function () {
  class SecureCookie {
    middleware (config, lws) {
      return function (ctx, next) {
        const secure = true
        ctx.cookies.set('test', 'one', { secure })
        ctx.cookies.set('test2', 'two', { secure })
        ctx.body = 'test'
      }
    }
  }
  const remotePort = 10000 + this.index
  const remoteLws = await Lws.create({
    port: remotePort,
    https: true,
    stack: [SecureCookie]
  })

  const port = 8100 + this.index
  const lws = await Lws.create({
    port,
    stack: [Rewrite, Static],
    rewrite: { from: '/', to: `https://localhost:${remotePort}/` },
    rewriteKeepSecureAttr: true
  })
  try {
    const response = await fetch(`http://localhost:${port}/`)
    a.strictEqual(response.status, 200)
    a.strictEqual(response.headers.get('set-cookie'), 'test=one; path=/; secure; httponly, test2=two; path=/; secure; httponly')
  } finally {
    lws.server.close()
    remoteLws.server.close()
  }
}, { timeout: 120000 })

tom.test('GET HTTPS, --rewrite.keep-secure-attr keeps sameSite value too, multiple cookies', async function () {
  class SecureCookie {
    middleware (config, lws) {
      return function (ctx, next) {
        const secure = true
        ctx.cookies.set('test', 'one', { secure, sameSite: 'none' })
        ctx.cookies.set('test2', 'two', { secure, sameSite: 'none' })
        ctx.body = 'test'
      }
    }
  }
  const remotePort = 10000 + this.index
  const remoteLws = await Lws.create({
    port: remotePort,
    https: true,
    stack: [SecureCookie]
  })

  const port = 8100 + this.index
  const lws = await Lws.create({
    port,
    stack: [Rewrite, Static],
    rewrite: { from: '/', to: `https://localhost:${remotePort}/` },
    rewriteKeepSecureAttr: true
  })
  try {
    const response = await fetch(`http://localhost:${port}/`)
    a.strictEqual(response.status, 200)
    a.strictEqual(response.headers.get('set-cookie'), 'test=one; path=/; samesite=none; secure; httponly, test2=two; path=/; samesite=none; secure; httponly')
  } finally {
    lws.server.close()
    remoteLws.server.close()
  }
}, { timeout: 120000 })

export default tom
