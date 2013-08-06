var fs = require('fs')
var assert = require('assert')
var request = require('request')
var tar = require('tar')
var readdir = require('lsr').sync
var color = require('bash-color')
var evaluate = require('../')

//download tests from http://hg.ecmascript.org/tests/test262/archive/tip.tar.gz

if (!fs.existsSync(__dirname + '/test262/test/suite')) {
  request('http://hg.ecmascript.org/tests/test262/archive/tip.tar.gz')
    .pipe(require('zlib').createGunzip())
    .pipe(tar.Extract({path:__dirname + '/test262', strip: 1}))
    .on('end', function () {
      execute()
    })
} else {
  execute()
}
function execute() {
  var command = process.argv[2]
  var timeout = 500;// ms
  var start = new Date()

  var skipCount = 0
  var failureCount = 0
  var passCount = 0

  var oldFailures = fs.readFileSync(__dirname + '/failures.txt', 'utf8').split('\n')
  var failures = []


  var special = [
    'S15.1.2.2_A5.1_T1.js', //node.js used to have a slightly broken parseInt
    '15.2.3.6-4-410.js' //node.js used to not do Object.defineProperty quite right
  ]

  readdir(__dirname + '/test262/test/suite', {filter: function (s) { return s.name != 'ignore' }})
    .filter(function (s) { return s.isFile() && /\.js$/.test(s.name) })
    .filter(function (s) { return special.indexOf(s.name) === -1})
    .forEach(function (file) {
      var source = require('fs').readFileSync(file.fullPath, 'utf8')

      var description = /^[ \*]*\@description (.*)$/m.exec(source)
      description = description && description[1]

      var start = new Date()

      try {
        if (/@negative/.test(source)) {
          var errored = false
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
            errored = true
          }
          assert(errored, 'test was meant to fail')
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
            },
            go: function (val, cb, eb) {
              var now = new Date()
              if (now - start > timeout) {
                throw new Error('Test timed out')
              }
              return cb(val)
            }
          })
        }
      } catch (ex) {
        failures.push(file.path)
        if (oldFailures.indexOf(file.path) != -1) {
          skipCount++
        } else {
          failureCount++
          console.log(color.red(' x ' + (description ? description + ' (' + file.path + ')' : file.path)))
          if (command === 'debug') {
            throw ex
          } else {
            console.log()
            console.log(ex.stack || ex.message || ex)
            console.log()
          }
          return
        }
      }
      passCount++
      if (command != 'quiet') console.log(color.green(' √ ' + (description || file.path)))
    })


  console.log()
  console.log(color.red(' - failed ' + failureCount))
  console.log(color.green(' - passed ' + passCount + ' (of which ' + (oldFailures.length - skipCount) + ' are new)'))
  console.log(color.cyan(' - skipped ' + skipCount))
  console.log()
  if (skipCount < oldFailures.length) {
    console.log(color.green(' - passed ' + passCount))
  }
  console.log()
  console.log(color.purple(' - duration ' + (new Date() - start) + 'ms'))

  if (command === 'save') {
    fs.writeFileSync(__dirname + '/failures.txt', failures.join('\n'))
  }

  process.exit(failureCount)
}