const LwsCli = require('lws/lib/cli-app')
const path = require('path')

class WsCli extends LwsCli {
  execute (options, argv) {
    const commandLineArgs = require('command-line-args')
    const cliOptions = commandLineArgs(this.partialDefinitions(), { camelCase: true, partial: true })
    if (cliOptions.defaultStack) {
      const list = require('./default-stack')
      this.log(list)
    } else {
      options = {
        stack: require('./default-stack').slice(),
        moduleDir: path.resolve(__dirname, `../node_modules`),
        modulePrefix: 'lws-'
      }
      return super.execute(options, argv)
    }
  }

  partialDefinitions () {
    return super.partialDefinitions().concat([
      {
        name: 'default-stack',
        type: Boolean,
        description: 'Print the default middleware stack. Any of these built-in middlewares are available to use in a custom stack.',
        section: 'core'
      }
    ])
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
    const pkg = require(path.resolve(__dirname, '..', 'package.json'))
    this.log(pkg.version)
  }
}

module.exports = WsCli
