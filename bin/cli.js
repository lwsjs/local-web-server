#!/usr/bin/env node
'use strict'
const Cli = require('../')

const ws = new Cli()
ws.middleware.addCors()
ws.middleware.addJson()
ws.middleware.addRewrite()
ws.middleware.addBodyParser()
ws.middleware.addBlacklist()
ws.middleware.addCache()
ws.middleware.addMimeType()
ws.middleware.addCompression()
ws.middleware.addLogging()
ws.middleware.addMockResponses()
ws.middleware.addSpa()

ws.middleware.addStatic()
ws.middleware.addIndex()
ws.listen()
