import TestRunner from 'test-runner'
import Rewrite from 'lws-rewrite'
import Static from 'lws-static'
import Lws from 'lws'
import fetch from 'node-fetch'
import a from 'assert'
import net from 'net'

const tom = new TestRunner.Tom('proxy')

tom.test('CONNECT request made to proxy', async function () {
  process.env.http_proxy = 'http://127.0.0.1:9000'
  const port = 8200 + this.index
  const lws = await Lws.create({
    port,
    stack: [Rewrite, Static],
    rewrite: { from: '/one', to: 'http://jsonplaceholder.typicode.com/posts/1' }
  })

  let proxyConnected = false
  const proxyServer = net.createServer(async function (c) {
    proxyConnected = true
    c.end('HTTP/1.1 200 Connection Established\nConnection: close\n\n')
  })
  proxyServer.listen(9000)

  try {
    await fetch(`http://localhost:${port}/one`)
    delete process.env.http_proxy
    a.strictEqual(proxyConnected, true)
  } finally {
    lws.server.close()
    proxyServer.close()
  }
})

export default tom
