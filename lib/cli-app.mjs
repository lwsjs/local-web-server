import LwsCli from 'lws/lib/cli-app.mjs'
import path from 'path'
import defaultStack from './default-stack.mjs'
import { promises as fs } from 'fs'

import getModulePaths from 'current-module-paths'
const __dirname = getModulePaths(import.meta.url).__dirname

class WsCli extends LwsCli {
  async execute (options) {
    if (options.defaultStack) {
      this.log(defaultStack)
    } else {
      return super.execute(options)
    }
  }

  getDefaultOptions () {
    return Object.assign(super.getDefaultOptions(), {
      stack: defaultStack.slice(),
      moduleDir: [process.cwd(), path.resolve(__dirname, '..')]
    })
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
        content: 'A lean, modular web server for rapid full-stack development.'
      },
      {
        header: 'Synopsis',
        content: [
          '$ ws <options>'
        ]
      }
    )
    sections.push({
      content: 'Project home: {underline https://github.com/lwsjs/local-web-server}'
    })
    return sections
  }

  async showVersion () {
    const version = JSON.parse(await fs.readFile(path.resolve(__dirname, '..', 'package.json'), 'utf8')).version
    this.log(version)
  }
}

export default WsCli
