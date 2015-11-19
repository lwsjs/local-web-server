const data = [
  { id: 1, name: 'Conifer', maxHeight: 115 },
  { id: 2, name: 'Eucalyptus', maxHeight: 210 },
  { id: 3, name: 'Ash', maxHeight: 40 },
  { id: 4, name: 'Elder', maxHeight: 5 },
  { id: 5, name: 'Holly', maxHeight: 10 }
]

module.exports = [
  /* CREATE */
  {
    request: { method: 'POST' },
    response: {
      status: 201,
      location: '/tree/1'
    }
  },
  /* READ */
  {
    request: { method: 'GET' },
    response: {
      status: 200,
      body: function (ctx) {
        return data.filter(tree => tree.maxHeight > Number(ctx.query.tallerThan))
      }
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
