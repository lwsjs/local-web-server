const fs = require('fs')

module.exports = {
  name: 'stream response',
  response: {
    body: fs.createReadStream(__filename)
  }
}
