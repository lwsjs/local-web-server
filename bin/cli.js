#!/usr/bin/env node
'use strict'
const path = require('path')

function onServerUp (port, directory, isHttps) {
  const ansi = require('ansi-escape-sequences')

  const ipList = getIPList()
    .map(iface => `[underline]{${isHttps ? 'https' : 'http'}://${iface.address}:${port}}`)
    .join(', ')

  console.error(ansi.format(
    path.resolve(directory || '') === process.cwd()
      ? `serving at ${ipList}`
      : `serving [underline]{${directory}} at ${ipList}`
  ))
}

function getIPList () {
  const flatten = require('reduce-flatten')
  const os = require('os')

  let ipList = Object.keys(os.networkInterfaces())
    .map(key => os.networkInterfaces()[key])
    .reduce(flatten, [])
    .filter(iface => iface.family === 'IPv4')
  ipList.unshift({ address: os.hostname() })
  return ipList
}

const LocalWebServer = require('../')
const ws = new LocalWebServer()
const server = ws.getServer()
server.on('listening', function () {
  onServerUp(ws.options.port, ws.options['static.root'], server.isHttps)
})
