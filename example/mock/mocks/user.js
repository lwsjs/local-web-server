const users = require('./users.json')

/* responses for /users/:id */
const mockResponses = [
  /* don't support POST here */
  { request: { method: 'POST' }, response: { status: 400 } },

  /* for GET requests, return a particular user */
  {
    request: { method: 'GET' },
    response: function (ctx, id) {
      ctx.body = users.find(user => user.id === Number(id))
    }
  },

  /* for PUT requests, update the record */
  {
    request: { method: 'PUT' },
    response: function (ctx, id) {
      const updatedUser = ctx.request.body
      const existingUserIndex = users.findIndex(user => user.id === Number(id))
      users.splice(existingUserIndex, 1, updatedUser)
      ctx.status = 200
    }
  },

  /* DELETE request: remove the record */
  {
    request: { method: 'DELETE' },
    response: function (ctx, id) {
      const existingUserIndex = users.findIndex(user => user.id === Number(id))
      users.splice(existingUserIndex, 1)
      ctx.status = 200
    }
  }
]

module.exports = mockResponses
