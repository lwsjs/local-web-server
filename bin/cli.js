#!/usr/bin/env node
'use strict'
const LocalWebServer = require('../')

const ws = new LocalWebServer()
ws.listen()
  .catch(err => console.error(err.stack))
