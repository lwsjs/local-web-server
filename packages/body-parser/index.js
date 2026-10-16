import koaBodyParser from 'koa-bodyparser'

class BodyParser {
  description () {
    return 'Parses the request body, making `ctx.request.body` available to downstream middleware.'
  }

  middleware () {
    return koaBodyParser({
      formLimit: '500mb',
      jsonLimit: '500mb',
      textLimit: '500mb',
      xmlLimit: '500mb'
    })
  }
}

export default BodyParser
