var Result = require('../tokens/result.js')

//Handles ForStatement

module.exports = evaluate
function evaluate(node, scope, evaluate, options) {
  return options.go(evaluate(node.init, scope, options), function loop() {
    return options.go(evaluate(node.test, scope, options), function (cont) {
      if (!cont) return
      return options.go(evaluate(node.body, scope, options), function (result) {
        if (result instanceof Result) return result
        return options.go(evaluate(node.update, scope, options), loop)
      })
    })
  })
}