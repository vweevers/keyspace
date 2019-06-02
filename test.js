'use strict'

const test = require('tape')
const keyspace = require('.')

// TODO: write more tests

test('basic', function (t) {
  const generator1 = keyspace(1e6, { distribution: 'zipfian', skew: 1, seed: 'a seed' })
  const generator2 = keyspace(1e6, { distribution: 'zipfian', skew: 1, seed: 'a seed', keyAsNumber: true })

  t.is(generator1.key(), 'fc2110')
  t.is(generator1.key(), 'fb4e')

  t.is(generator2.key(), 8715) // fc2110
  t.is(generator2.key(), 329) // fb4e

  t.end()
})
