const data = require('./trees')

module.exports = [
  /* CREATE */
  {
    request: { method: 'POST' },
    response: function (ctx) {
      data.push(ctx.request.body)
      this.status = 201
      this.location = '/tree/1'
    }
  },
  /* READ */
  {
    request: { method: 'GET' },
    response: function (ctx) {
      this.status = 200
      this.body = data.filter(tree => tree.maxHeight > Number(ctx.query.tallerThan || 0))
    }
  },
  /* UPDATE (forbidden on collection)*/
  {
    request: { method: 'PUT' },
    response: { status: 404 }
  },
  /* DELETE (forbidden on collection) */
  {
    request: { method: 'DELETE' },
    response: { status: 404 }
  }
]

// curl -i http://localhost:8000/trees -H 'content-type: application/json'  -d '{"id":6, "name":"Oak", "maxHeight": 100 }'
// curl -i http://localhost:8000/trees
