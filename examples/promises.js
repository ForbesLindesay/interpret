var evaluate = require('../')

// This example demonstrates how you can create complete co-routine support by overriding the behaviour of `go`.

function log() {
  for (var i = 0; i < 20; i++) {
    delay(500) // this seems synchronous because it returns a promise and `go` waits for that promise to complete
    console.log('tick')
  }
}

var Promise = require('Promise')
var end = evaluate(log, {
  scope: {
    console: console,
    delay: function (ms) {
      return new Promise(function (resolve, reject) {
        setTimeout(resolve, ms)
      })
    }
  },
  go: function (val, cb, eb) {
    return Promise.from(val).then(cb, eb)
  }
})
//The result is a promise now because of `go`
end.done(function () {
  clearInterval(interval)
})

// note how the code is actually run asynchronously and in its own special context
// so the event loop is not starved
var interval = setInterval(function () {
  console.log('working...')
}, 500)