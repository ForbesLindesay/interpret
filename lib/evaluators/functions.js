'use strict'

var Scope = require('../scope.js')
var Result = require('../token/result.js')
var Token = require('../token')


//Handles FunctionDeclaration and FunctionExpression

module.exports = evaluate
function evaluate(node, scope, evaluate, options) {
  return function fn() {
    var s = new Scope(false, scope, this)
    if (node.id) {
      if (node.id.type === 'Identifier') {
        s.declare(node.id.name, 'var', fn)
      } else {
        throw new Error('un-recognized function id type "' + node.params[i].type + '"')
      }
    }
    s.declare('arguments', 'arguments', arguments)
    for (var i = 0; i < node.params.length; i++) {
      if (node.params[i].type === 'Identifier') {
        s.declare(node.params[i].name, 'var', arguments[i])
      } else {
        throw new Error('un-recognized param type "' + node.params[i].type + '"')
      }
    }
    return options.go(evaluate(node.body, s, options), function (res) {
      if (res instanceof Result) {
        return res.val
      } else if (res instanceof Token) {
        return res
      } else {
        return undefined
      }
    })
  }
}