var esprima = require('esprima')
var serialEval = require('../utils.js').serialEval

//Handles CallExpression

module.exports = evaluate
function evaluate(node, scope, evaluate, options) {
  if (node.callee.type === 'Identifier' && node.callee.name === 'eval') {
    return object.go(evaluate(node.arguments[0], scope, options), function (arg) {
      return evaluate(esprima.parse(arg), scope, options)
    })
  } else if (node.callee.type === 'MemberExpression') {
    var self = evaluate(node.callee.object, scope, options)
    var fn = options.go(self, function (obj) {
      return evaluate({
        type: 'MemberExpression',
        computed: node.callee.computed,
        object: {type: 'Literal', value: obj},
        property: node.callee.property
      }, scope, options)
    })
    return options.go(self, function (self) {
      return options.go(fn, function (fn) {
        return options.go(serialEval(node.arguments, scope, evaluate, options), function (args) {
          return fn.apply(self, args)
        })
      })
    })
  } else {
    return options.go(evaluate(node.callee, scope, options), function (fn) {
      return options.go(serialEval(node.arguments, scope, evaluate, options), function (args) {
        return fn.apply(scope.self(), args)
      })
    })
  }
}