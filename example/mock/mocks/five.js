module.exports = {
  response: function (ctx, id) {
    ctx.body = `<h1>id: ${id}, name: ${ctx.query.name}</h1>`
  }
}
