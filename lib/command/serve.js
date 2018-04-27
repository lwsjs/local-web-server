const ServeCommand = require('lws/lib/command/serve')
const path = require('path')

class WsServe extends ServeCommand {
  execute (options, argv) {
    const usage = require('lws/lib/usage')
    usage.defaults
      .set('an', 'ws')
      .set('av', require('../../package').version)
      .set('cd4', 'cli')
    options = {
      stack: require('../default-stack'),
      moduleDir: path.resolve(__dirname, `../../node_modules`),
      modulePrefix: 'lws-'
    }
    return super.execute(options, argv)
  }

  usage () {
    const sections = super.usage()
    sections.shift()
    sections.shift()
    sections.pop()
    sections.unshift(
      {
        header: 'local-web-server',
        content: 'The modular web server for productive full-stack development.'
      },
      {
        header: 'Synopsis',
        content: [
          '$ ws <options>',
          '$ ws {underline command} <options>'
        ]
      }
    )
    sections.push({
      content: 'Project home: {underline https://github.com/lwsjs/local-web-server}'
    })
    return sections
  }

  showVersion () {
    const pkg = require(path.resolve(__dirname, '..', '..', 'package.json'))
    console.log(pkg.version)
  }
}

module.exports = WsServe
