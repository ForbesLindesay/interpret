var Token = require('../token')

//Handles LogicalExpression

module.exports = evaluate
function evaluate(node, scope, evaluate, options) {
  if (!(node.operator === '||' || node.operator === '&&')) {
    throw new Error('Unrecognized operator `' + node.operator + '`')
  }
  return options.go(evaluate(node.left, scope, options), function (left) {
    if (left) {
      if (node.operator === '||' || left instanceof Token) {
        return left
      } else {
        return evaluate(node.right, scope, options)
      }
    } else {
      if (node.operator === '||') {
        return evaluate(node.right, scope, options)
      } else {
        return left
      }
    }
  })
}