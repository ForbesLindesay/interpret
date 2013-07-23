'use strict'

var Token = require('./')

module.exports = Break
function Break(name) {
  Token.call(this)
  this.name = name
}
Break.prototype = Object.create(Token.prototype)
Break.prototype.constructor = Break