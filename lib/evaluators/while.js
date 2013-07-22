var Result = require('../tokens/result.js')

//Handles WhileStatement

module.exports = evaluate
function evaluate(node, scope, evaluate, options) {
  return (function loop() {
    return options.go(evaluate(node.test, scope, options), function (cont) {
      if (!cont) return
      return options.go(evaluate(node.body, scope, options), function (result) {
        if (result instanceof Result) return result
        else return loop()
      })
    })
  }())
}