var operators = ['-', '+', '~', '!']
var ops = {}
for (var i = 0; i < operators.length; i++) {
  ops[operators[i]] = Function('arg', 'return ' + operators[i] + 'arg')
}

//Handles UnaryExpression
module.exports = evaluate
function evaluate(node, scope, evaluate, options) {
  return options.go(evaluate(node.argument, scope, options), function (val) {
    if (node.operator === 'typeof') return typeof val
    return ops[node.operator](val)
  })
}