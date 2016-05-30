'use strict'
const Koa = require('koa')
const localWebServer = require('../')
const liveReload = require('koa-livereload')
const convert = require('koa-convert')

const app = new Koa()
const ws = localWebServer({
  log: { format: 'dev' }
})

app.use(liveReload())
app.use(ws)
app.listen(8000)
