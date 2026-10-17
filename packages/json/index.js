import json from 'koa-json'

class Json {
  description () {
    return 'Pretty-prints JSON responses. Also converts node object streams to binary.'
  }

  middleware () {
    return json()
  }
}

export default Json
