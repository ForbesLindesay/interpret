var evaluate = require('../')

// This examples is aimed to demonstate that the basic synchronous API is a competent enought interpreter
// to be useful for real world applications

var fibs = evaluate(function fibs() {
  return function (rec) {
    function fibr(n) {
      return n > 1 ? fibr(n - 1) + fibr(n - 2) : 1
    }
    function fib(n) {
      var last = 0, current = 1, next
      var res = 0
      var stre = {}
      var i = 0
      for (stre.i = 0; stre.i < n; stre.i++) {
        next = last + current
        last = current
        current = next
      }
      return current
    }
    var res
    for (var i = 0; i < 5; i++) {
      console.log('working...')
      if (rec) res = [0,1,2,3,4,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map(fibr)
      else res = [0,1,2,3,4,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map(fib)
    }
    return res
  }
}, {
  scope: { console: console }
})

console.log('Recursive')
console.log('=========')
console.log()
var start = new Date()
console.dir(fibs(true))
console.log('duration: ' + (new Date() - start) + 'ms')
console.log()
console.log('Iterative')
console.log('=========')
console.log()
start = new Date()
console.dir(fibs(false))
console.log('duration: ' + (new Date() - start) + 'ms')