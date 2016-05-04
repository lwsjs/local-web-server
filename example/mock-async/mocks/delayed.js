module.exports = {
  response: function (ctx) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        ctx.body = '<h1>You waited 2s for this</h1>'
        resolve()
      }, 2000)
    })
  }
}
