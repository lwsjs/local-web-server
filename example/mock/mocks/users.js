const users = [
  { id: 1, name: 'Lloyd', age: 40, nationality: 'English' },
  { id: 2, name: 'Mona', age: 34, nationality: 'Palestinian' },
  { id: 3, name: 'Francesco', age: 24, nationality: 'Italian' }
]

const mockResponses = [
  { request: { method: 'PUT' }, response: { status: 400 } },
  { request: { method: 'DELETE' }, response: { status: 400 } },
  {
    /* for GET requests, return a subset of data filtered on 'minAge' and 'nationality' */
    request: { method: 'GET' },
    response: function (ctx) {
      ctx.body = users.filter(user => {
        const meetsMinAge = user.age >= (Number(ctx.query.minAge) || 0)
        const requiredNationality = user.nationality === (ctx.query.nationality || user.nationality)
        return meetsMinAge && requiredNationality
      })
    }
  },
  {
    /* for POST requests, create a new user with the request data (a JSON user) */
    request: { method: 'POST' },
    response: function (ctx) {
      const newUser = ctx.request.body
      users.push(newUser)
      newUser.id = users.length
      ctx.status = 201
      ctx.response.set('Location', `/users/${newUser.id}`)
    }
  }
]

module.exports = mockResponses
