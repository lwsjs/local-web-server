#!/usr/bin/env node
'use strict'
const LocalWebServer = require('../')

const ws = new LocalWebServer()
ws.addCors()
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
  .start()
