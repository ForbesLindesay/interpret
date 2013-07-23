var Token = require('../token')

//Handles IfStatement and ConditionalExpression
module.exports = evaluate
function evaluate(node, scope, evaluate, options) {
  return options.go(evaluate(node.test, scope, options), function (condition) {
    if (condition instanceof Token) return condition
    if (condition) {
      return evaluate(node.consequent, scope, options)
    } else if (node.alternate) {
      return evaluate(node.alternate, scope, options)
    }
  })
}