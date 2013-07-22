var serialEval = require('../utils.js').serialEval

//Handles AssignmentExpression

module.exports = evaluate
function evaluate(node, scope, evaluate, options) {
  if (node.left.type === 'MemberExpression') {
    return options.go(serialEval([node.left.object, node.left.property.calculated ? node.left.property : node.left.property.name, node.right], scope, evaluate, options), function (res) {
      var obj = res[0]
      var member = res[1]
      res = res[2]
      if (node.operator !== '=')
        res = binaryOperation(node.operator.substring(0, node.operator.length - 1), obj[member], res)
      obj[member] = res
      return res
    })
  } else if (node.left.type === 'Identifier') {
    if (node.operator === '=') {
      return options.go(evaluate(node.right, scope, options), function (res) {
        scope.set(node.left.name, res)
        return res
      })
    } else {
      return options.go(serialEval([node.left, node.right], scope, evaluate, options), function (res) {
        res = binaryOperation(node.operator.substring(0, node.operator.length - 1), res[0], res[1])
        scope.set(node.left.name, res)
        return res
      })
    }
  } else {
    throw new Error('Assigning to a node of type `' + node.left.type + '` is not currently supported.')
  }
}