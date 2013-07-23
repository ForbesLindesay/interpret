var Break = require('../token/break')
var Continue = require('../token/continue')

// Handles BreakStatement and ContinueStatement

module.exports = evaluate
function evaluate(node, scope, evaluate, options) {
  var name = undefined
  if (node.label) {
    name = node.label.name
  }
  if (node.type === 'ContinueStatement') return new Continue(name)
  if (node.type === 'BreakStatement') return new Break(name)
}