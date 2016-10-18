'use strict'
const arrayify = require('array-back')

exports.checkResponse = checkResponse
exports.fail = fail

function checkResponse (t, status, bodyTests) {
  return function (response) {
    if (status) t.strictEqual(response.res.statusCode, status)
    if (bodyTests) {
      arrayify(bodyTests).forEach(body => {
        t.ok(body.test(response.data), 'correct data')
      })
    }
  }
}

function fail (t) {
  return function (err) {
    t.fail('failed: ' + err.stack)
  }
}
