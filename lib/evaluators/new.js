var serialEval = require('../utils.js').serialEval

//Handles NewExpression

module.exports = evaluate
function evaluate(node, scope, evaluate, options) {
  return options.go(evaluate(node.callee, scope, options), function (fn) {
    return options.go(serialEval(node.arguments, scope, evaluate, options), function (args) {
      var argNames = []
      for (var i = 0; i < args.length; i++) {
        argNames.push('a' + i)
      }
      var create = Function(argNames.join(',') + ',Fn', 'return new Fn(' + argNames.join(',') + ')')
      args.push(Fn)
      return create.apply(this, args)
    })
  })
}