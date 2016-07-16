'use strict'

class Yeah {
  middleware () {
    return function (req, res, next) {
      res.end('Yeah?')
      next()
    }
  }
}

class Logger {
  middleware () {
    const express = require('express')
    const app = express()
    app.use((req, res, next) => {
      console.log('incoming', req.url)
      next()
    })
    return app
  }
}

class Header {
  middleware () {
    return function (req, res, next) {
      res.setHeader('x-pointless', 'yeah?')
      next()
    }
  }
}

class PieHeader {
  middleware () {
    const Koa = require('koa')
    const app = new Koa()
    app.use((ctx, next) => {
      ctx.set('x-pie', 'steak and kidney')
      next()
    })
    return app.callback()
  }
}

const http = require('http')
const server = http.createServer()
server.listen(8100)
const yeah = new Yeah()
const logger = new Logger()
const header = new Header()
const pie = new PieHeader()
const stack = [
  logger.middleware(),
  header.middleware(),
  pie.middleware(),
  yeah.middleware()
]
server.on('request', function (req, res) {
  let index = 0
  function processNext () {
    const mw = stack[index++]
    if (mw) mw(req, res, processNext)
  }
  processNext()
})
