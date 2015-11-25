module.exports = {
  response: function (ctx, id, name) {
    ctx.body = `<h1>id: ${id}, name: ${name}</h1>`
  }
}
