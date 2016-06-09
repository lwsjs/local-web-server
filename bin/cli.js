#!/usr/bin/env node
'use strict'
const Cli = require('../')

const ws = new Cli()
ws.middleware
  .addCors()
  .addJson()
  .addRewrite()
  .addBodyParser()
  .addBlacklist()
  .addCache()
  .addMimeType()
  .addCompression()
  .addLogging()
  .addMockResponses()
  .addSpa()
  .addStatic()
  .addIndex()
ws.listen()
