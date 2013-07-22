var fs = require('fs')
var evaluate = require('../')

//download tests from http://hg.ecmascript.org/tests/test262/
directory(__dirname + '/compliance', 'test it supports all JavaScript features')
function directory(path, name) {
  describe(name, function () {
    fs.readdirSync(path)
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
  it(name, function () {
    evaluate(require('fs').readFileSync(path, 'utf8'), {
      '$ERROR': function (msg) {
        throw msg
      }
    })
  })
}