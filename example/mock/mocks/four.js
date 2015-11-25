const fs = require('fs')

module.exports = {
  response: {
    body: fs.createReadStream(__filename)
  }
}
