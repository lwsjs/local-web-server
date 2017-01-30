'use strict'

/**
 * Feature interface.
 */
class Feature {
  constructor (localWebServer) {}

  /**
   * Return one or more options definitions to collect command-line input
   * @returns {OptionDefinition|OptionDefinition[]}
   */
  optionDefinitions () {}

  /**
   * Return one of more middleware functions with three args (req, res and next). Can be created by express, Koa or hand-rolled.
   */
   middleware (options) {}

   expandStack () {
     const flatten = require('reduce-flatten')

     if (this.stack) {
       const featureStack = this.stack()
         .map(Feature => new Feature())

       this.optionDefinitions = function () {
         return featureStack
           .map(feature => feature.optionDefinitions && feature.optionDefinitions())
           .filter(definitions => definitions)
           .reduce(flatten, [])
       }
       this.middleware = function (options, view) {
         return featureStack
           .map(feature => feature.middleware(options, view))
           .reduce(flatten, [])
           .filter(mw => mw)
       }
     }
     return this
   }
}

module.exports = Feature
