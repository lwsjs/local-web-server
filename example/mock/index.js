'use strict'
const request = require('req-then')
const $ = document.querySelector.bind(document)

request('http://localhost:8000/tree').then(response => {
  $('ul').innerHTML = JSON.parse(response.data).map(tree => {
    return `<li>${tree.name}</li>`
  }).join('')
})
