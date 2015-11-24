module.exports = {
  response: function (ctx, id, name) {
    this.body = {
      id: id,
      name: name
    }
  }
}
