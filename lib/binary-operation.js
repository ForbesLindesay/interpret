var binaryOperators = ['+', '-', '*', '/', '%', '<<', '>>', '>>>', '&',
                       '|', '^', '===', '==', '>=',
                       '<=', '<', '>', '!=', '!==', 'instanceof']
var ops = {}
for (var i = 0; i < binaryOperators.length; i++) {
  ops[binaryOperators[i]] = Function('left,right', 'return left ' + binaryOperators[i] + ' right')
}

module.exports = evaluate
function evaluate(op, left, right) {
  return ops[op](left, right)
}
