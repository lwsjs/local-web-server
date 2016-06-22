#!/usr/bin/env node
'use strict'
const LocalWebServer = require('../')

const ws = new LocalWebServer()
ws.listen()
