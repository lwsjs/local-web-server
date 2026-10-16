import TestRunner from 'test-runner'
import assert from 'assert'
import Spa from 'lws-spa'

const a = assert.strict
const tom = new TestRunner.Tom()

tom.test('optionDefinititions work', async function () {
  const spa = new Spa()
  const result = spa.optionDefinitions()
  a.ok(result.length)
})

export default tom
