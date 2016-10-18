module.exports = {
  name: '/five/:id?name=:name',
  response: function (ctx, id) {
    ctx.body = `<h1>id: ${id}, name: ${ctx.query.name}</h1>`
  }
}
