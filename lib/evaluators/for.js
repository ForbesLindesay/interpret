var Token = require('../token')
var Break = require('../token/break')
var Continue = require('../token/continue')

//Handles ForStatement

module.exports = evaluate
function evaluate(node, scope, evaluate, options) {
  console.dir(node)
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