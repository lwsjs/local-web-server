class MiddlewareList {
  description () {
    return 'Print available middleware'
  }
  execute (options) {
    const list = [
      'lws-request-monitor',
      'lws-log',
      'lws-cors',
      'lws-json',
      'lws-rewrite',
      'lws-body-parser',
      'lws-blacklist',
      'lws-conditional-get',
      'lws-mime',
      'lws-compress',
      'lws-mock-response',
      'lws-spa',
      'lws-static',
      'lws-index'
    ]
    console.log(list)
  }
}

module.exports = MiddlewareList
