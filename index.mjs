import Lws from 'lws'
import defaultStack from './lib/default-stack.mjs'
import currentModulePaths from 'current-module-paths'
const { __dirname } = currentModulePaths(import.meta.url)

/**
 * @module local-web-server
 */

/**
  * @alias module:local-web-server
  */
class LocalWebServer extends Lws {
  _getDefaultConfig () {
    return Object.assign(super._getDefaultConfig(), {
      moduleDir: [process.cwd(), __dirname],
      stack: defaultStack
    })
  }
}

export default LocalWebServer
