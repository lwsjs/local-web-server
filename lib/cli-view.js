'use strict'

class CliView {
  constructor (localWebServer) {
    this.localWebServer = localWebServer
  }
  /**
   * @example
   * { log: 'whatever' }
   * { config: { static: { root: 1, hidden: 2 } } }
   */
  write (msg) {
    const writeToStdout = [ 'log', 'info' ]
    Object.keys(msg).forEach(key => {
      if (writeToStdout.includes(key)) {
        console.log(msg[key])
      } else if (key === 'config' && msg.config && this.localWebServer.options.verbose) {
        printLine(msg.config)
      } else if (key === 'error') {
        const ansi = require('ansi-escape-sequences')
        console.error(ansi.format(msg.error, 'red'))
      }
    })
  }
}

module.exports = CliView

function printLine (config) {
  const output = objectToTable(config)
  process.stderr.write(output)
}

/**
 * create a nested table for deep object trees
 */
function objectToTable (object) {
  const ansi = require('ansi-escape-sequences')
  const tableLayout = require('table-layout')
  const t = require('typical')

  const data = Object.keys(object).map(key => {
    if (t.isObject(object[key])) {
      return { key: ansi.format(key, 'bold'), value: objectToTable(object[key]) }
    } else {
      return { key: ansi.format(key, 'bold'), value: object[key] }
    }
  })
  return tableLayout(data, {
    padding: { left: '', right: ' ' },
    columns: [
      // { name: 'key', width: 18 },
      // { name: 'value', nowrap: true }
    ]
  })
}
