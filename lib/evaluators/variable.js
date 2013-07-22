//Handles VariableDeclarator
module.exports = evaluate
function evaluate(node, scope, evaluate, options) {
  return options.go(node.init ? evaluate(node.init, scope, options) : undefined, function (init) {
      return scope.declare(node.id.name, 'var', init)
    })
}