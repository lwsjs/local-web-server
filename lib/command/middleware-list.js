class MiddlewareList {
  description () {
    return 'Print available middleware'
  }
  execute (options) {
    const list = require('../default-stack')
    console.log(list)
  }
}

module.exports = MiddlewareList
