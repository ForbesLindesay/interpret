var Token = require('../token')

//Handles WhileStatement

module.exports = evaluate
function evaluate(node, scope, evaluate, options) {
  return (function loop() {
    return options.go(evaluate(node.test, scope, options), function (cont) {
      if (!cont) return
      return options.go(evaluate(node.body, scope, options), function (result) {
        if (result instanceof Token) return result
        else return loop()
      })
    })
  }())
}