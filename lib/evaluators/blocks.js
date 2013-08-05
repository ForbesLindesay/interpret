var Token = require('../token')


//Handles BlockStatement and Program

module.exports = evaluate
function evaluate(node, scope, evaluate, options) {
  for (var i = 0; i < node.body.length; i++) {
    if (node.body[i].type === 'FunctionDeclaration') {
      scope.declare(node.body[i].id.name, 'function', evaluate(node.body[i], scope, options))
    }
  }
  return (function next(i) {
    if (i === node.body.length) return undefined
    if (node.body[i].type === 'FunctionDeclaration') {
      if (node.body.length === i + 1) return scope.get(node.id.name)
      return next(i + 1)
    }
    return options.go(evaluate(node.body[i], scope, options), function (res) {
      if (res instanceof Token) {
        return res
      }
      if (node.body.length === i + 1) return res
      return next(i + 1)
    })
  }(0))
}