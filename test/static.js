'use strict'
const test = require('tape')
const request = require('req-then')
const localWebServer = require('../')
const http = require('http')

function launchServer (app, options) {
  options = options || {}
  const path = `http://localhost:8100${options.path || '/'}`
  const server = http.createServer(app.callback())
  return server.listen(options.port || 8100, () => {
    const req = request(path, options.reqOptions)
    if (options.onSuccess) req.then(options.onSuccess)
    if (!options.leaveOpen) req.then(() => server.close())
    req.catch(err => console.error('LAUNCH ERROR', err.stack))
  })
}

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
    t.ok(/test/.test(response.data))
  }})
})
