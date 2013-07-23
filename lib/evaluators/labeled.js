var Break = require('../token/break.js')
var Continue = require('../token/continue.js')

//Handles LogicalExpression

module.exports = evaluate
function evaluate(node, scope, evaluate, options) {
  return options.go(evaluate(node.body, scope, options), function (result) {
    if (result instanceof Break && result.name === node.label.name) {
      return undefined
    }
    if (result instanceof Continue && result.name === node.label.name) {
      if (result.next) return result.next()
      else return evaluate(node, scope, evaluate, options)
    }
    return result
  })
}