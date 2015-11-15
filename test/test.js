'use strict'
const test = require('tape')
const request = require('req-then')
const localWebServer = require('../')
const http = require('http')
const PassThrough = require('stream').PassThrough

function launchServer (app, options) {
  options = options || {}
  const path = `http://localhost:8100${options.path || '/'}`
  const server = http.createServer(app.callback())
  return server.listen(8100, () => {
    const req = request(path, options.reqOptions)
    if (options.onSuccess) req.then(options.onSuccess)
    if (!options.leaveOpen) req.then(() => server.close())
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
      root: __dirname + '/fixture',
      options: {
        index: 'file.txt'
      }
    }
  })
  launchServer(app, { onSuccess: response => {
    t.strictEqual(response.data, 'test\n')
  }})
})

test('serve-index', function (t) {
  t.plan(2)
  const app = localWebServer({
    log: { format: 'none' },
    serveIndex: {
      path: __dirname + '/fixture',
      options: {
        icons: true
      }
    }
  })
  launchServer(app, { onSuccess: response => {
    t.ok(/listing directory/.test(response.data))
    t.ok(/class="icon/.test(response.data))
  }})
})

test('compress', function(t){
  t.plan(1)
  const app = localWebServer({
    compress: true,
    log: { format: 'none' },
    static: { root: __dirname + '/fixture' }
  })
  launchServer(
    app,
    {
      reqOptions: { headers: { 'Accept-Encoding': 'gzip' } },
      path: '/big-file.txt',
      onSuccess: response => {
        t.strictEqual(response.res.headers['content-encoding'], 'gzip')
      }
    }
  )
})

test('mime', function(t){
  t.plan(1)
  const app = localWebServer({
    log: { format: 'none' },
    static: { root: __dirname + '/fixture' },
    mime: { 'text/plain': [ 'php' ]}
  })
  launchServer(app, { path: '/something.php', onSuccess: response => {
    t.ok(/text\/plain/.test(response.res.headers['content-type']))
  }})
})

test('blacklist', function (t) {
  t.plan(2)
  const app = localWebServer({
    log: { format: 'none' },
    static: { root: __dirname + '/fixture' },
    blacklist: [ /php$/, /html$/ ]
  })
  const server = launchServer(app, { leaveOpen: true })
  request('http://localhost:8100/something.php')
    .then(response => {
      t.strictEqual(response.res.statusCode, 403)
      request('http://localhost:8100/ajax.html')
        .then(response => {
          t.strictEqual(response.res.statusCode, 403)
          server.close()
        })
    })
})

test.skip('directories: should serve index and static files', function(t){
  t.plan(1)
  const app = localWebServer({
    log: { format: 'none' },
    directories: [
      __dirname + '/fixture/one'
    ]
  })
  launchServer(app, { path: '/something.php', onSuccess: response => {
    t.ok(/text\/plain/.test(response.res.headers['content-type']))
  }})
})

test('proxy', function(t){
  t.plan(1)
  const app = localWebServer({
    log: { format: 'none' },
    proxy: []
  })
  launchServer(app, { path: '/something.php', onSuccess: response => {
    t.ok(/text\/plain/.test(response.res.headers['content-type']))
  }})
})
