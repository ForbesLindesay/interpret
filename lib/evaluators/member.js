var serialEval = require('../utils.js').serialEval

//Handles MemberExpression
module.exports = evaluate
function evaluate(node, scope, evaluate, options) {
  return options.go(serialEval([node.object, node.computed ? node.property : node.property.name], scope, evaluate, options), function (res) {
    var obj = res[0]
    var member = res[1]
    var res = obj[member]
    if (typeof res === 'function') {
      if (Array.isArray(obj)) {
        switch (member) {
          case 'pop':
          case 'push':
          case 'reverse':
          case 'shift':
          case 'splice':
          case 'unshift':
          case 'concat':
          case 'join':
          case 'slice':
          case 'toString':
          case 'lastIndexOf':
            return res
          case 'map':
            return function map(fn, thisarg) {
              var result = []
              var done = null
              for (var i = 0; i < this.length; i++) {
                (function (self, i) {
                  done = options.go(done, function () {
                    return options.go(fn.call(self[i], i, self), function (res) {
                      result.push(res)
                    })
                  })
                }(this, i))
              }
              return options.go(done, function () {
                return result
              })
            }
            return options.go(done, function () { return result })
          case 'forEach':
            return function forEach(fn, thisarg) {
              var done = null
              for (var i = 0; i < this.length; i++) {
                (function (self, i) {
                  done = options.go(done, function () {
                    return fn.call(self[i], i, self)
                  })
                }(this, i))
              } 
              return done
            }
            return done
          case 'sort': // mutator method
          default:
            throw new Error('Array method `' + member + '` is not supported.')
        }
      }
    }
    return res
  })
}