#!/usr/bin/env node
'use strict'
const localWebServer = require('../')

localWebServer()
  .listen(8000, () => {
    console.log(`listening`)
  })
