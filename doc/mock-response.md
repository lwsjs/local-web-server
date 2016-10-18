## Mock Responses

Mocks give you full control over the response headers and body returned to the client. They can be used to return anything from a simple html string to a resourceful REST API. Typically, they're used to mock services but can be used for anything.

In the config, define an array called `mocks`. Each mock definition maps a <code>[route](http://expressjs.com/guide/routing.html#route-paths)</code> to a `response`. A simple home page:
```json
{
  "mocks": [
    {
      "route": "/",
      "response": {
        "body": "<h1>Welcome to the Mock Responses example</h1>"
      }
    }
  ]
}
```

Under the hood, the property values from the `response` object are written onto the underlying [koa response object](https://github.com/koajs/koa/blob/master/docs/api/response.md). You can set any valid koa response properies, for example [type](https://github.com/koajs/koa/blob/master/docs/api/response.md#responsetype-1):
```json
{
  "mocks": [
    {
      "route": "/",
      "response": {
        "type": "text/plain",
        "body": "<h1>Welcome to the Mock Responses example</h1>"
      }
    }
  ]
}
```

### Conditional Response

To define a conditional response, set a `request` object on the mock definition. The `request` value acts as a query - the response defined will only be returned if each property of the `request` query matches. For example, return an XML response *only* if the request headers include `accept: application/xml`, else return 404 Not Found.

```json
{
  "mocks": [
    {
      "route": "/two",
      "request": { "accepts": "xml" },
      "response": {
        "body": "<result id='2' name='whatever' />"
      }
    }
  ]
}
```

### Multiple Potential Responses

To specify multiple potential responses, set an array of mock definitions to the `responses` property. The first response with a matching request query will be sent. In this example, the client will get one of two responses depending on the request method:

```json
{
  "mocks": [
    {
      "route": "/three",
      "responses": [
        {
          "request": { "method": "GET" },
          "response": {
            "body": "<h1>Mock response for 'GET' request on /three</h1>"
          }
        },
        {
          "request": { "method": "POST" },
          "response": {
            "status": 400,
            "body": { "message": "That method is not allowed." }
          }
        }
      ]
    }
  ]
}
```

### Dynamic Response

The examples above all returned static data. To define a dynamic response, create a mock module. Specify its path in the `module` property:
```json
{
  "mocks": [
    {
      "route": "/four",
      "module": "/mocks/stream-self.js"
    }
  ]
}
```

Here's what the `stream-self` module looks like. The module should export a mock definition (an object, or array of objects, each with a `response` and optional `request`). In this example, the module simply streams itself to the response but you could set `body` to *any* [valid value](https://github.com/koajs/koa/blob/master/docs/api/response.md#responsebody-1).
```js
const fs = require('fs')

module.exports = {
  response: {
    body: fs.createReadStream(__filename)
  }
}
```

### Response function

For more power, define the response as a function. It will receive the [koa context](https://github.com/koajs/koa/blob/master/docs/api/context.md) as its first argument. Now you have full programmatic control over the response returned.
```js
module.exports = {
  response: function (ctx) {
    ctx.body = '<h1>I can do anything i want.</h1>'
  }
}
```

If the route contains tokens, their values are passed to the response. For example, with this mock...
```json
{
  "mocks": [
    {
      "route": "/players/:id",
      "module": "/mocks/players.js"
    }
  ]
}
```

...the `id` value is passed to the `response` function. For example, a path of `/players/10?name=Lionel` would pass `10` to the response function. Additional, the value `Lionel` would be available on `ctx.query.name`:
```js
module.exports = {
  response: function (ctx, id) {
    ctx.body = `<h1>id: ${id}, name: ${ctx.query.name}</h1>`
  }
}
```

### RESTful Resource example

Here's an example of a REST collection (users). We'll create two routes, one for actions on the resource collection, one for individual resource actions.

```json
{
  "mocks": [
    { "route": "/users", "module": "/mocks/users.js" },
    { "route": "/users/:id", "module": "/mocks/user.js" }
  ]
}
```

Define a module (`users.json`) defining seed data:

```json
[
  { "id": 1, "name": "Lloyd", "age": 40, "nationality": "English" },
  { "id": 2, "name": "Mona", "age": 34, "nationality": "Palestinian" },
  { "id": 3, "name": "Francesco", "age": 24, "nationality": "Italian" }
]
```

The collection module:

```js
const users = require('./users.json')

/* responses for /users */
const mockResponses = [
  /* Respond with 400 Bad Request for PUT and DELETE - inappropriate on a collection */
  { request: { method: 'PUT' }, response: { status: 400 } },
  { request: { method: 'DELETE' }, response: { status: 400 } },
  {
    /* for GET requests return a subset of data, optionally filtered on 'minAge' and 'nationality' */
    request: { method: 'GET' },
    response: function (ctx) {
      ctx.body = users.filter(user => {
        const meetsMinAge = (user.age || 1000) >= (Number(ctx.query.minAge) || 0)
        const requiredNationality = user.nationality === (ctx.query.nationality || user.nationality)
        return meetsMinAge && requiredNationality
      })
    }
  },
  {
    /* for POST requests, create a new user and return the path to the new resource */
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
```

The individual resource module:

```js
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
```

[Example](https://github.com/75lb/local-web-server/tree/master/example/mock).