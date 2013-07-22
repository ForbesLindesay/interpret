var binaryOperation = require('../binary-operation.js')


//Handles BinaryExpression

module.exports = evaluate
function evaluate(node, scope, evaluate, options) {
  return options.go(evaluate(node.left, scope, options), function (left) {
    return options.go(evaluate(node.right, scope, options), function (right) {
      var res = binaryOperation(node.operator, left, right)
      return res
    })
  })
}