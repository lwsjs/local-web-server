module.exports = [
  {
    request: {
      accepts: 'json'
    },
    response: {
      status: 200,
      body: { id: 2, name: 'eucalyptus', maxHeight: 210 }
    }
  },
  {
    request: {
      accepts: 'xml'
    },
    response: {
      status: 200,
      body: '<tree id="2" name="eucalyptus" maxHeight="210"/>'
    }
  }
]
