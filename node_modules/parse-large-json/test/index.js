'use strict'

const test = require('tape')
const parse = require('../index')

test('test parsing', t => {
  const testObj = {
    str: '"  faf ¦gxv9¾¶ª8K\u0011s?\u0006i;&\u0007Z>k¯¼\u000b¼SZ\u000f¡u-¨\u000b6}\u00014»¹$\'v:3t­LwÀ>[\u000b££"^{2\u00129\',fark\'19\': \'p¡RS>\u0013\u0018!¡v¶08\rf@L·¶o 1l:\u0003rFbÇª@Æ¼0[&S\u0010³W^ÅmK*/N9©\u0005uVQ¢_kÀqªC\u0002=KÀ II%hpS[<u7H8z2(+szs\u0010\n\u0017/¢®\u001f ok ending: $*|"" ""',
    n1: 1,
    n2: 0.123,
    n3: -1,
    n4: -1.23,
    no: false,
    nada: null,
    yes: true,
    obj1: {
      arr1: [1, 2, 3, 'larks'],
      arr2: [null, true, { wat: 'yes' }, [{}]],
      obj2: {'so-strange': 'yes'}
    }
  }
  parse(JSON.stringify(testObj), 0)
  .then(({val, rest}) => {
    t.equal(rest, '', 'should not have rest')
    t.deepEqual(val, testObj, 'should result in correct object')
    t.end()
  }, err => t.fail(err))
})

test.skip('test chunking', t => {
  // @TODO: this
})
