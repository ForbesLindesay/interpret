var fs = require('fs')
var assert = require('assert')
var evaluate = require('../')

//download tests from http://hg.ecmascript.org/tests/test262/
directory(__dirname + '/compliance', 'test it supports all JavaScript features')
function directory(path, name) {
  describe(name, function () {
    fs.readdirSync(path).sort()
      .forEach(function (name) {
        if (fs.statSync(path + '/' + name).isDirectory()) {
          if (/ignore/.test(name)) return
          directory(path + '/' + name, name)
        } else {
          file(path + '/' + name, name)
        }
      })
  })
}
function file(path, name) {
  var source = require('fs').readFileSync(path, 'utf8')
  /*if (!/@negative/.test(source)) {
    try {
      evaluate.parse(source)
    } catch (ex) {
      if (/^Expressions of type/.test(ex.message)) {
        it.skip(name, function () {})
        return
      }
    }
  }*/
  if (/\$INCLUDE/.test(source.toString())) {
    it.skip(name, function () {})
    return
  }
  it(name, function () {
    if (/@negative/.test(source)) {
      try {
        evaluate(source, {
          scope: {
            'console': console,
            '$ERROR': function (msg) {
              throw msg
            },
            runTestCase: function (fn) {
              assert(fn())
            }
          }
        })
      } catch (ex) {
        return
      }
      assert(false, 'test was meant to fail')
    } else {
      evaluate(source, {
        scope: {
          'console': console,
          '$ERROR': function (msg) {
            throw msg
          },
          runTestCase: function (fn) {
            assert(fn(), 'runTestCase should be given a function which returns true')
          }
        }
      })
    }
  })
}