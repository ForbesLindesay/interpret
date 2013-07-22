var util = require('util')

exports.serialEval = serialEval
function serialEval(nodes, scope, evaluate, options) {
  var result = []
  return loop(0)
  function loop(i) {
    if (i === nodes.length) return result
    var next = nodes[i]
    if (Array.isArray(next)) {
      next = serialEval(next, scope, evaluate, options)
    } else if (typeof next != 'string') {
      next = evaluate(next, scope, options)
    }
    return options.go(next, function (next) {
      result.push(next)
      return loop(i + 1)
    })
  }
}

function isLiteral(elem) {
  return elem.type === 'Literal'
}
function isCachable(elem) {
  return elem.type === 'Literal' || (elem.type === 'Cached' && elem.src) || elem.type === 'Identifier'
}
function getCache(elem) {
  if (elem.type === 'Identifier') return 'store.get("' + elem.name + '")'
  return elem.type === 'Literal' ? util.inspect(elem.value) : (elem.src || 'evaluate(' + JSON.stringify(elem) + ', scope, options)')
}
exports.simplify = function simplify(ast) {
  if (ast && ast.type && typeof ast.type === 'string') {
    for (var key in ast) {
      if (Array.isArray(ast[key])) {
        ast[key] = ast[key].map(simplify)
      } else if (ast[key] && typeof ast[key] === 'object') {
        ast[key] = simplify(ast[key])
      }
    }
  } else {
    return ast
  }
  switch (ast.type) {
    case 'ArrayExpression':
      if (ast.elements.every(isCachable)) {
        var src = '[' + ast.elements.map(getCache).join(',') + ']'
        return {
          type: 'Cached',
          value: Function('store', 'return ' + src),
          src: src
        }
      } else {
        return ast
      }
    case 'BinaryExpression':
      if (isCachable(ast.left) && isCachable(ast.right)) {
        var src = getCache(ast.left) + ' ' + ast.operator + ' ' + getCache(ast.right)
        return {
          type: 'Cached',
          value: Function('store', 'return ' + src),
          src: src
        }
      } else {
        return ast
      }
    case 'UpdateExpression':
      if (ast.argument.type === 'Identifier' && (ast.operator === '++' || ast.operator === '--')) {
        return {
          type: 'Cached',
          value: Function('scope', ast.prefix ?
            'var val = scope.get("' + ast.argument.name + '") ' + (ast.operator === '++' ? '+' : '-') + ' 1\nscope.set("' + ast.argument.name + '",val)\nreturn val':
            'var val = scope.get("' + ast.argument.name + '")\nscope.set("' + ast.argument.name + '", val ' + (ast.operator === '++' ? '+' : '-') + ' 1)\nreturn val')
        }
      } else if (ast.argument.type === 'MemberExpression' && (ast.operator === '++' || ast.operator === '--')) {
        var access = ast.argument.property.calculated ? 'obj[prop]' : 'obj.' + ast.argument.property.name
        var result = (ast.prefix ? ast.operator + access : access + ast.operator)
        if (ast.argument.property.calculated) {
          result = 'options.go(evaluate(prop, scope, options), function (prop) { return ' + result + ' })'
        }
        var src = 'return function(scope, evaluate, options){ return options.go(evaluate(obj, scope, options), function (obj) { return ' + result + ' }) }'
        return {
          type: 'Cached',
          value: Function('obj,prop', src)(ast.argument.object, ast.argument.property)
        }
      } else {
        return ast
      }
    default:
      return ast
  }
/*
        AssignmentExpression: 'AssignmentExpression',
        BlockStatement: 'BlockStatement',
        BreakStatement: 'BreakStatement',
        CallExpression: 'CallExpression',
        CatchClause: 'CatchClause',
        ConditionalExpression: 'ConditionalExpression',
        ContinueStatement: 'ContinueStatement',
        DoWhileStatement: 'DoWhileStatement',
        DebuggerStatement: 'DebuggerStatement',
        EmptyStatement: 'EmptyStatement',
        ExpressionStatement: 'ExpressionStatement',
        ForStatement: 'ForStatement',
        ForInStatement: 'ForInStatement',
        FunctionDeclaration: 'FunctionDeclaration',
        FunctionExpression: 'FunctionExpression',
        Identifier: 'Identifier',
        IfStatement: 'IfStatement',
        Literal: 'Literal',
        LabeledStatement: 'LabeledStatement',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        NewExpression: 'NewExpression',
        ObjectExpression: 'ObjectExpression',
        Program: 'Program',
        Property: 'Property',
        ReturnStatement: 'ReturnStatement',
        SequenceExpression: 'SequenceExpression',
        SwitchStatement: 'SwitchStatement',
        SwitchCase: 'SwitchCase',
        ThisExpression: 'ThisExpression',
        ThrowStatement: 'ThrowStatement',
        TryStatement: 'TryStatement',
        UnaryExpression: 'UnaryExpression',
        UpdateExpression: 'UpdateExpression',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarator: 'VariableDeclarator',
        WhileStatement: 'WhileStatement',
        WithStatement: 'WithStatement'
*/
}