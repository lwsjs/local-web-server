'use strict'
const arrayify = require('array-back')
const path = require('path')
const url = require('url')
const debug = require('./debug')
const mw = require('./middleware')
const t = require('typical')
const compose = require('koa-compose')
const flatten = require('reduce-flatten')

/**
 * @module middleware-stack
 */

/**
 * @extends Array
 * @alias module:middleware-stack
 */
class MiddlewareStack extends Array {
  /**
   * @param {module:middleware-stack~middleware}
   * @chainable
   */
  add (middleware) {
    this.push(middleware)
    return this
  }

  getOptionDefinitions () {
    return this
      .filter(mw => mw.optionDefinitions)
      .map(mw => mw.optionDefinitions)
      .reduce(flatten, [])
      .map(def => {
        def.group = 'middleware'
        return def
      })
  }
  compose (options) {
    const convert = require('koa-convert')
    const middlewareStack = this
      .filter(mw => mw.middleware)
      .map(mw => mw.middleware)
      .map(middleware => middleware(options))
      .filter(middleware => middleware)
      .reduce(flatten, [])
      .map(convert)
    return compose(middlewareStack)
  }
}

module.exports = MiddlewareStack

/**
 * @typedef middleware
 * @property optionDefinitions {object|object[]}
 * @property middleware {function}
 */
