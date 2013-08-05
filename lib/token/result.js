'use strict'

var Token = require('./')

module.exports = Result
function Result(val) {
  Token.call(this)
  this.val = val
}
Result.prototype = Object.create(Token.prototype)
Result.prototype.constructor = Result