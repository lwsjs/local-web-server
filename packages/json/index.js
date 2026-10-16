class Json {
  description () {
    return 'Pretty-prints JSON responses. Also converts node object streams to binary.'
  }

  middleware () {
    const json = require('koa-json')
    return json()
  }
}

module.exports = Json
