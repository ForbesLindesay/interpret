var Token = require('../token')
var Break = require('../token/break')
var Continue = require('../token/continue')
var Scope = require('../scope')

//Handles ForStatement

module.exports = evaluate
function evaluate(node, scope, evaluate, options) {
  return options.go(evaluate(node.right, scope, options), function (obj) {
    var blockScope = new Scope(true, scope, scope.self())
    var keys = []
    for (var key in obj) {
      keys.push(key)
    }
    keys = keys.reverse()
    return loop()
    function loop() {
      if (keys.length === 0) return
      var init
      switch (node.left.type) {
        case 'VariableDeclaration':
          node.left.declarations[i].init = keys.pop()
          init = node.left
          break
        case 'Identifier':
          init = {type: 'AssignmentExpression', operator: '=', left: node.left, right: {type: 'Literal', value: keys.pop()} }
          break;
        default:
          throw new Error('unsupported left hand side in for in loop')
      }
      return options.go(evaluate(init, blockScope, options), function () {
        return options.go(evaluate(node.block, blockScope, options), function (result) {
          if (result instanceof Break && result.name === undefined) return undefined
          if (result instanceof Continue && result.name === undefined) return loop()
          else if (result instanceof Continue) result.next = loop
          if (result instanceof Token) return result
          
          return loop()
        })
      })
    }
  })
  throw new Error('node not supported')
  if (node.init) return options.go(evaluate(node.init, scope, options), loop)
  else return loop()

  function loop() {
    if (options.test) return options.go(evaluate(node.test, scope, options), next)
    else return next(true)
    function next(cont) {
      if (!cont) return
      return options.go(evaluate(node.body, scope, options), function (result) {
        if (result instanceof Break && result.name === undefined) return undefined
        if (result instanceof Continue && result.name === undefined) return loop()
        else if (result instanceof Continue) result.next = loop
        if (result instanceof Token) return result
        if (node.update) return options.go(evaluate(node.update, scope, options), loop)
        else return loop()
      })
    }
  }
}