'use strict'

const zipfian = require('zipfian-integer')
const uniform = require('uniform-integer')
const lexint = require('lexicographic-integer')
const prb = require('pseudo-random-buffer')
const pmr = require('pseudo-math-random')

module.exports = function keyspace (n, options) {
  options = options || {}

  if (!Number.isInteger(n)) {
    throw new TypeError('The first argument "n" must be an integer')
  } else if (n < 0) {
    throw new RangeError('The first argument "n" must be >= 0')
  }

  const randomBytes = prb(options.seed)
  const prng = pmr(options.seed)

  // Note: skew=0 also results in a uniform distribution.
  const zipf = options.distribution === 'zipfian'
  const skew = options.skew || 0
  const sample = zipf ? zipfian(0, n - 1, skew, prng) : uniform(0, n - 1, prng)
  const offset = options.offset || 0

  // TODO: support randomized valueSizes
  const valueSize = options.valueSize || 0
  const generateValueSize = (fallback) => valueSize || fallback

  const { keyAsBuffer, valueAsBuffer, keyAsNumber } = options
  const keyGenerators = {}
  const valueGenerators = {}

  keyGenerators.random = function () {
    return keyGenerators.seq(sample())
  }

  keyGenerators.seq = function (i) {
    i += offset

    if (keyAsNumber) {
      return i
    } else if (keyAsBuffer) {
      return Buffer.from(lexint.pack(i))
    } else {
      return lexint.pack(i, 'hex')
    }
  }

  keyGenerators.seqReverse = function (i) {
    return keyGenerators.seq(n - i - 1)
  }

  valueGenerators.random = function () {
    const size = generateValueSize(16)

    if (valueAsBuffer) {
      return randomBytes(size)
    } else {
      return randomBytes(size / 2 + 1).toString('hex').slice(0, size)
    }
  }

  valueGenerators.empty = function () {
    const size = generateValueSize(0)
    return valueAsBuffer ? Buffer.alloc(size) : '0'.repeat(size)
  }

  return {
    key: keyGenerators[options.keys || 'random'],
    value: valueGenerators[options.values || 'random'],
    keyGenerators,
    valueGenerators
  }
}
