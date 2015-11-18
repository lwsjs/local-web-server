module.exports = [
  {
    request: {
      method: 'GET'
    },
    response: {
      status: 200,
      body: [
        { id: 1, name: 'conifer', maxHeight: 115 },
        { id: 2, name: 'eucalyptus', maxHeight: 210 }
      ]
    }
  },
  {
    request: {
      method: 'POST'
    },
    response: {
      status: 201,
      location: '/tree/1'
    }
  }
]
