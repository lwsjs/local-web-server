module.exports = [
  /* CREATE (409 CONFLICT - should be called on the collection) */
  {
    request: { method: 'POST' },
    response: { status: 409 }
  },
  /* READ */
  {
    request: { method: 'GET' },
    response: {
      status: 200,
      body: { id: 2, name: 'eucalyptus', maxHeight: 210 }
    }
  },
  /* UPDATE */
  {
    request: { method: 'PUT' },
    response: { status: 204 }
  },
  /* DELETE */
  {
    request: { method: 'DELETE' },
    response: { status: 204 }
  }
]
