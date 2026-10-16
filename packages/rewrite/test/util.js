import TestRunner from 'test-runner'
import util from '../lib/util.js'
import { strict as a } from 'assert'

const tom = new TestRunner.Tom()

tom.test('parseRewriteRules: empty', async function () {
  const rules = []
  const result = util.parseRewriteRules(rules)
  a.deepStrictEqual(result, [])
})

tom.test('parseRewriteRules: undefined', async function () {
  const rules = undefined
  const result = util.parseRewriteRules(rules)
  a.deepStrictEqual(result, [])
})

tom.test('parseRewriteRules', async function () {
  const rules = [
    '/one -> /two',
    '/three -> http://example.com/four'
  ]
  const result = util.parseRewriteRules(rules)
  a.deepStrictEqual(result, [
    { from: '/one', to: '/two' },
    { from: '/three', to: 'http://example.com/four' }
  ])
})

tom.test('getTargetUrl: no params, url matches', async function () {
  const result = util.getTargetUrl('/one', '/two', '/one')
  a.strictEqual(result, '/two')
})

tom.test('getTargetUrl: no params, url does not match', async function () {
  const result = util.getTargetUrl('/one', '/two', '/three')
  a.strictEqual(result, '/three')
})

tom.test('getTargetUrl: replace named parameter', async function () {
  const result = util.getTargetUrl('/one/:id', '/:id/two', '/one/2')
  a.strictEqual(result, '/2/two')
})

tom.test("getTargetUrl: don't replace named parameter", async function () {
  const result = util.getTargetUrl('/one/:id', '/:id/two', '/one/2/one')
  a.strictEqual(result, '/one/2/one')
})

tom.test('getTargetUrl: replace named parameter twice', async function () {
  const result = util.getTargetUrl('/one/:id', '/:id/two/:id', '/one/2')
  a.strictEqual(result, '/2/two/2')
})

tom.test('getTargetUrl: replaced wildcard', async function () {
  const result = util.getTargetUrl('/(.*)', 'http://example.com/$1', '/api/2/data')
  a.strictEqual(result, 'http://example.com/api/2/data')
})

tom.test('getTargetUrl: replaced named param plus wildcard', async function () {
  const result = util.getTargetUrl('/:name/(.*)', 'http://example.com/$2/:name', '/api/2/data')
  a.strictEqual(result, 'http://example.com/2/data/api')
})

tom.test('removeHopSpecificHeaders', async function () {
  const headers = {
    connection: 'test',
    'keep-alive': 'test',
    'proxy-authenticate': 'test',
    'proxy-authorization': 'test',
    te: 'test',
    trailer: 'test',
    'transfer-encoding': 'test',
    upgrade: 'test'
  }
  util.removeHopSpecificHeaders(headers)
  a.deepStrictEqual(headers, {})
})

tom.test('removeCookieAttribute', async function () {
  const setCookie = 'lastVisit=03/02/2020, 23:02:40; path=/; secure; httponly'
  const result = util.removeCookieAttribute(setCookie, 'secure')
  a.strictEqual(result, 'lastVisit=03/02/2020, 23:02:40; path=/; httponly')
})

tom.test('removeCookieAttribute 2', async function () {
  const setCookie = 'lastVisit=03/02/2020, 23:02:40;Secure; httponly'
  const result = util.removeCookieAttribute(setCookie, 'secure')
  a.strictEqual(result, 'lastVisit=03/02/2020, 23:02:40; httponly')
})

tom.test('removeCookieAttribute 3', async function () {
  const setCookie = ''
  const result = util.removeCookieAttribute(setCookie, 'secure')
  a.strictEqual(result, '')
})

tom.test('removeCookieAttribute 4', async function () {
  const setCookie = undefined
  const result = util.removeCookieAttribute(setCookie, 'secure')
  a.strictEqual(result, '')
})

export default tom
