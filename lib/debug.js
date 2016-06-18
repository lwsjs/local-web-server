module.exports = debug

let level = 0

function debug () {
  if (level) console.error.apply(console.error, arguments)
}

debug.setLevel = function () {
  level = 1
}
