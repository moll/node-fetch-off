var Headers = require("./headers")
var request = require("./request")
var defineLazyProperty = require("lazy-object").defineLazyProperty
module.exports = Request

function Request(url, opts) {
  this.url = url
  this.options = opts
  this.method = opts && opts.method && opts.method.toUpperCase() || "GET"
}

Request.prototype.then = function(onResolve, onReject) {
  return request(this.url, this.options).then(onResolve, onReject)
}

defineLazyProperty(Request.prototype, "headers", function() {
  return new Headers(this.options.headers)
})
