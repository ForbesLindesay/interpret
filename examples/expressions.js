var evaluate = require('../')

// This example just has some assorted tests in it

evaluate(function () {
  console.dir(!true)
  console.dir(!false)
  var x = 0
  while (x < 5) {
    console.dir(x++)
  }
  console.dir(function () { return this }.call({hello:'world'}))
}, {
  scope: { console: console }
})