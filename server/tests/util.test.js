const {capitalise} = require('../api/lib/util')

describe('util test', () => {
  test('capitalise resets and capitalises a string...', () => {
    const testString = 'miRaNda'
    const result = capitalise(testString)
    expect(result).toBe('Miranda')
  })

  test("capitalise doesn't throw on empty...", () => {
    const testString = ''
    const testFn = () => capitalise(testString)
    expect(testFn).not.toThrow()
  })
})
