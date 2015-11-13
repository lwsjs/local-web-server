'use strict'
const test = require('tape')
const request = require('req-then')
const localWebServer = require('../')
const http = require('http')
const PassThrough = require('stream').PassThrough

function launchServer (app, reqOptions, path, onSuccess) {
  path = `http://localhost:8100${path || '/'}`
  const server = http.createServer(app.callback())
  server.listen(8100, () => {
    const req = request(path, reqOptions)
    if (onSuccess) req.then(onSuccess)
    req.then(() => server.close())
    req.catch(err => console.error('LAUNCH ERROR', err.stack))
  })
}

test('log: common', function (t) {
  t.plan(1)
  const stream = PassThrough()

  stream.on('readable', () => {
    let chunk = stream.read()
    if (chunk) t.ok(/GET/.test(chunk.toString()))
  })

  const app = localWebServer({
    log: {
      format: 'common',
      options: {
        stream: stream
      }
    }
  })
  launchServer(app)
})

test('static', function (t) {
  t.plan(1)
  const app = localWebServer({
    log: { format: 'none' },
    static: {
      root: __dirname + '/static',
      options: {
        index: 'file.txt'
      }
    }
  })
  launchServer(app, null, '/', response => {
    t.strictEqual(response.data, 'test\n')
  })
})

test('serve-index', function (t) {
  t.plan(2)
  const app = localWebServer({
    log: { format: 'none' },
    serveIndex: {
      path: __dirname + '/static',
      options: {
        icons: true
      }
    }
  })
  launchServer(app, null, null, response => {
    t.ok(/listing directory/.test(response.data))
    t.ok(/class="icon/.test(response.data))
  })
})

test('compress', function(t){
  t.plan(1)
  const app = localWebServer({
    compress: true,
    log: { format: 'none' },
    static: { root: __dirname + '/static' }
  })
  launchServer(app, { headers: { 'Accept-Encoding': 'gzip' } }, '/big-file.txt', response => {
    t.strictEqual(response.res.headers['content-encoding'], 'gzip')
  })
})

test('mime', function(t){
  t.plan(1)
  const app = localWebServer({
    log: { format: 'none' },
    static: { root: __dirname + '/static' },
    mime: { 'text/plain': [ 'php' ]}
  })
  launchServer(app, null, '/something.php', response => {
    t.ok(/text\/plain/.test(response.res.headers['content-type']))
  })
})
