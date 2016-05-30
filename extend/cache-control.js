'use strict'
const Koa = require('koa')
const localWebServer = require('../')
const cacheControl = require('koa-cache-control')
const convert = require('koa-convert')

const app = new Koa()
const ws = localWebServer({
  'no-cache': true,
  log: { format: 'dev' }
})

app.use(convert(cacheControl({
  maxAge: 15
})))
app.use(ws)
app.listen(8000)
