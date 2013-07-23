'use strict'

var Token = require('./')

module.exports = Continue
function Continue(name) {
  Token.call(this)
  this.name = name
}
Continue.prototype = Object.create(Token.prototype)
Continue.prototype.constructor = Continue