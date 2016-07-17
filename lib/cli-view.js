class CliView {
  constructor (localWebServer) {
    this.options = localWebServer.options
  }
  info (key, value) {
    if (key && value) {
      const ansi = require('ansi-escape-sequences')
      const tableLayout = require('table-layout')
      const output = tableLayout({ key: ansi.format(key, 'bold'), value: value}, {
        padding: { left: '', right: ' ' },
        columns: [
          { name: 'key', width: 18 },
          { name: 'value', nowrap: true }
        ]
      })
      process.stderr.write(output)
    } else {
      console.error(key)
    }
  }
  verbose (key, value) {
    if (this.options.verbose) {
      this.info(key, value)
    }
  }
  error (msg) {
    console.error(ansi.format(msg, 'red'))
  }
}

module.exports = CliView
