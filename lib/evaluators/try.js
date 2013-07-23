var Scope = require('../scope')
var Result = require('../tokens/result')

//Handles TryStatement and CatchClause
module.exports = evaluate
function evaluate(node, scope, evaluate, options) {
  if (node.guardedHandlers && node.guardedHandlers.length > 0) {
    throw new Error('Guarded Handlers are not yet supported')
  }
  if (node.handlers && node.handlers.length > 1) {
    throw new Error('Only 1 catch clause per try block is supported')
  }
  options.attempt(function () {
    return evaluate(node.block, scope, options)
  }, function (res) {
    if (res instanceof Result) return res
    if (node.finalizer) {
      return evaluate(node.finalizer, scope, options)
    }
  }, function (err) {
    if (node.handlers) {
      var s = new Scope(true, scope, scope.self())
      s.declareBlock(node.handlers[0].param.name, 'var', err)
      options.go(evaluate(node.handlers[0].body, s, options), after)
    } else {
      after()
    }
    function after(res) {
      if (res instanceof Result) return res
      if (node.finalizer) {
        return evaluate(node.finalizer, scope, options)
      }
    }
  })
}