'use strict'
const test = require('tape')
const request = require('req-then')
const localWebServer = require('../')
const http = require('http')
const PassThrough = require('stream').PassThrough

test('static', function (t) {
  t.plan(1)
  const app = localWebServer({
    static: {
      root: __dirname + '/static',
      options: {
        index: 'file.txt'
      }
    }
  })
  const server = http.createServer(app.callback())
  server.listen(8100)
  request('http://localhost:8100')
    .then(response => {
      t.strictEqual(response.data, 'test\n')
    })
    .then(() => server.close())
})

test('serve-index', function (t) {
  t.plan(2)
  const app = localWebServer({
    serveIndex: {
      path: __dirname + '/static',
      options: {
        icons: true
      }
    }
  })
  const server = http.createServer(app.callback())
  server.listen(8100)
  request('http://localhost:8100/')
    .then(response => {
      t.ok(/listing directory/.test(response.data))
      t.ok(/class="icon/.test(response.data))
    })
    .then(() => server.close())
})

test('log: common', function (t) {
  t.plan(1)
  const stream = PassThrough()

  stream.on('readable', () => {
    let chunk = stream.read()
    if (chunk) t.ok(/GET/.test(chunk.toString()))
  })

  const app = localWebServer({
    logger: {
      format: 'common',
      options: {
        stream: stream
      }
    }
  })
  const server = http.createServer(app.callback())
  server.listen(8100)
  request('http://localhost:8100/')
    .then(() => server.close())
})

test('compress', function(t){
  const app = localWebServer({ compress: true })

})

function launchServer (app, onSuccess) {
  const server = http.createServer(app.callback())
  server.listen(8100)
  const req = request('http://localhost:8100/')
  if (onSuccess) req.then(onSuccess)
  req.then(() => server.close())
}
