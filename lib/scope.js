module.exports = Scope

function Dictionary() {

}
Dictionary.prototype.set = function (key, value) {
  this['dictionary-key:' + key] = value
}
Dictionary.prototype.get = function (key) {
  if (!this.has(key)) {
    throw new Error('Key `' + key + '` was not found in the dictionary.')
  }
  return this['dictionary-key:' + key]
}
Dictionary.prototype.has = function (key) {
  return this.hasOwnProperty('dictionary-key:' + key)
}

function Scope(isBlock, parent, self) {
  this.isBlock = isBlock
  this.parent = parent
  this._self = self
  this.dict = new Dictionary()
  this.type = new Dictionary()
}

Scope.prototype.self = function () {
  return this._self
}

Scope.prototype.get = function (name) {
  if (this.dict.has(name)) {
    return this.dict.get(name)
  } else if (this.parent) {
    return this.parent.get(name)
  } else {
    throw new Error('Reference Error: ' + name + ' is not defined.')
  }
}

Scope.prototype.set = function (name, value) {
  if (this.dict.has(name)) {
    if (this.type.get(name) === 'const') {
      throw new Error('You cannot assign to ' + name + ' because it is a const.')
    }
    this.dict.set(name, value)
  } else if (this.parent) {
    this.parent.set(name, value)
  } else {
    throw new Error('Reference Error: ' + name + ' is not defined.')
  }
  return this
}

Scope.prototype.declare = function (name, type, initial) {
  if (this.isBlock) this.parent.declare(name, type, initial)
  else this.declareBlock(name, type, initial)
  return this
}

Scope.prototype.declareBlock = function (name, type, initial) {
  if ((type != 'var' && type != 'function' && this.dict.has(name)) || (this.type.has(name) && this.type.get(name) != 'var' && this.type.get(name) != 'function')) {
    throw new Error('A variable called ' + name + ' has already been declared in this scope.')
  }
  this.dict.set(name, initial)
  this.type.set(name, type)
}