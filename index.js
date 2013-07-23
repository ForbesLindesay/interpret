'use strict'

var esprima = require('esprima')
var check = require('syntax-error')

var Scope = require('./lib/scope.js')
var simplify = require('./lib/utils.js').simplify
var serialEval = require('./lib/utils.js').serialEval
var binaryOperation = require('./lib/binary-operation.js')

var Result = require('./lib/token/result.js')


exports = (module.exports = evaluate)
function evaluate(source, options) {
  options = options || {}
  var scope = options.scope || new Scope(false, undefined, undefined)
  if (!(scope instanceof Scope)) {
    scope = new Scope(false, undefined, undefined)
    Object.keys(options.scope).forEach(function (key) {
      scope.declare(key, 'const', options.scope[key])
    })
  }
  options.go = options.go || function (val, cb, eb) { return cb(val) }
  options.attempt = options.attempt || function (fn, cb, eb) {
    try {
      var res = fn()
    } catch (ex) {
      return options.go(ex, eb)
    }
    return options.go(res, cb, eb)
  }
  source = parse(source, options)
  return evaluateNode(source, scope, options)
}
exports.parse = parse
function parse(source, options) {
  options = options || {}
  try {
    if (typeof source === 'function') source = '(' + source.toString() + '())'
    if (typeof source === 'string') source = esprima.parse('"use strict";' + source)
  } catch (ex) {
    var err
    if (err = check(source, options.filename || 'interpreted.js')) {
      err.message = err.annotated.trim()
      throw err
    } else {
      throw ex
    }
  }
  source = simplify(source)
  //console.log(require('util').inspect(source, false, 20, true))
  ;(function verify(source) {
    if (typeof evaluators[source.type] != 'function') {
      throw new Error('Expressions of type `' + source.type + '` are not yet supported.')
    }
    for (var key in source) {
      if (Array.isArray(source[key])) {
        source[key].forEach(verify)
      } else if (source[key] && typeof source[key] === 'object' && typeof source[key].type === 'string') {
        verify(source[key])
      }
    }
  }(source))
  return source
}

var evaluators = {
  'BlockStatement': require('./lib/evaluators/blocks.js'),
  'Program': require('./lib/evaluators/blocks.js'),
  'ExpressionStatement': expressionStatement,
  'CallExpression': require('./lib/evaluators/calls.js'),
  'NewExpression': require('./lib/evaluators/new.js'),
  'FunctionDeclaration': require('./lib/evaluators/functions.js'),
  'FunctionExpression': require('./lib/evaluators/functions.js'),
  'ReturnStatement': returnStatement,
  'Literal': literal,
  'Cached': cached,
  'BinaryExpression': require('./lib/evaluators/binary.js'),
  'LogicalExpression': require('./lib/evaluators/logical.js'),
  'Identifier': identifier,
  'ArrayExpression': array,
  'ObjectExpression': object,
  'EmptyStatement': empty,
  'ForStatement': require('./lib/evaluators/for.js'),
  'MemberExpression': require('./lib/evaluators/member.js'),
  'IfStatement': require('./lib/evaluators/if.js'),
  'ConditionalExpression': require('./lib/evaluators/if.js'),
  'VariableDeclaration': variableDeclarations,
  'VariableDeclarator': require('./lib/evaluators/variable.js'),
  'AssignmentExpression': require('./lib/evaluators/assignment.js'),
  'UnaryExpression': require('./lib/evaluators/unary.js'),
  'WhileStatement': require('./lib/evaluators/while.js'),
  'ThisExpression': thisExpression,
  'TryStatement': require('./lib/evaluators/try.js'),
  'ThrowStatement': throwStatement,
  'LabeledStatement': require('./lib/evaluators/labeled.js'),
  'BreakStatement': require('./lib/evaluators/break-continue.js'),
  'ContinueStatement': require('./lib/evaluators/break-continue.js'),

  'UpdateExpression': compileTime,
  'Property': handledElsewhere,
  'CatchClause': handledElsewhere
}
function empty() {}
function expressionStatement(node, scope, evaluate, options) {
  return evaluate(node.expression, scope, options)
}
function returnStatement(node, scope, evaluate, options) {
  if (node.argument) return options.go(evaluate(node.argument, scope, options), function (val) { return new Result(val) })
  else return new Result(undefined)
}
function literal(node) {
  return node.value
}
function cached(node, scope, evaluate, options) {
  return node.value(scope, evaluate, options)
}
function identifier(node, scope) {
  return scope.get(node.name)
}
function array(node, scope, evaluate, options) {
  return serialEval(node.elements, scope, evaluate, options)
}
function object(node, scope, evaluate, options) {
  var res = {}
  var ready = null
  var properties = []
  var props = {}
  for (var i = 0; i < node.properties.length; i++) {
    (function (i) {
      ready = options.go(ready, function () {
        var key = node.properties[i].key.type === 'Identifier' ? node.properties[i].key.name : evaluate(node.properties[i].key, scope, options)
        return options.go(key, function (key) {
          return options.go(evaluate(node.properties[i].value, scope, options), function (val) {
            if (node.properties[i].kind === 'set' || node.properties[i].kind === 'get') {
              if (!props['key:' + key]) {
                properties.push(props['key:' + key] = {name: key})
              }
              props['key:' + key][node.properties[i].kind] = val
            } else {
              res[key] = val
            }
          })
        })
      })
    }(i))
  }
  for (var i = 0; i < properties.length; i++) {
    Object.defineProperty(res, properties[i].name, {
      get: properties[i].get,
      set: properties[i].set
    })
  }
  return res
}
function variableDeclarations(node, scope, evaluate, options) {
  return serialEval(node.declarations, scope, evaluate, options)
}
function thisExpression(node, scope, evaluate, options) {
  return scope.self()
}
function throwStatement(node, scope, evaluate, options) {
  options.go(evaluate(node.argument, scope, options), function (res) {
    throw res
  })
}



function compileTime(node) {
  throw new Error(node.type + ' should be converted to `Cached` at compile time.')
}
function handledElsewhere(node) {
  throw new Error(node.type + ' should be handled elsewhere.')
}

function evaluateNode(node, scope, options) {
  if (evaluators[node.type]) return evaluators[node.type](node, scope, evaluateNode, options)
  console.dir(node)
  var ex = new Error('Unrecognized node type "' + node.type + '"')
  throw ex
}

var remaining = Object.keys(esprima.Syntax).filter(function (t) { return !(t in evaluators)})
console.dir(remaining)