'use strict'

class TestMiddleware {
  middleware (option) {
    return function (ctx, next) {
      ctx.body = '1234512345'
      return next()
    }
  }
}

module.exports = TestMiddleware
