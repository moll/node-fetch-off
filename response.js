var Headers = desire("node-fetch/lib/headers") || require("node-fetch").Headers
var defineLazyProperty = require("lazy-object").defineLazyProperty
var BODY_USED_ERR = "Body has already been consumed."
module.exports = Response

function Response(res) {
  this.response = res
  this.status = res.statusCode
  this.statusText = res.statusMessage
  this.ok = res.statusCode >= 200 && res.statusCode < 300
  this.bodyUsed = !res.readable
}

Response.prototype.type = "basic"
Response.prototype.bodyUsed = false

defineLazyProperty(Response.prototype, "headers", function() {
  return new Headers(this.response.headers)
})

// Couldn't find the title of the TypeError error to throw in the spec, but
// Firefox throws it with "Body has already been consumed.".
// https://fetch.spec.whatwg.org/#response-class
Response.prototype.arrayBuffer = function() {
  // NOTE: Error has to be returned in a promise.
  if (this.bodyUsed) return Promise.reject(new TypeError(BODY_USED_ERR))
  this.bodyUsed = true

  var res = this.response
  var chunks = []

  return new Promise(function(resolve, reject) {
    res.on("data", function(chunk) { chunks.push(chunk) })
    res.on("end", function(chunk) { resolve(Buffer.concat(chunks)) })
    res.once("error", reject)
  })
}

Response.prototype.blob = function() {
  throw new Error("Not implemented")
}

Response.prototype.formData = function() {
  throw new Error("Not implemented")
}

// https://fetch.spec.whatwg.org/#dom-body-text
Response.prototype.text = function() {
  return this.arrayBuffer().then(function(buffer) {
    return buffer.toString("utf8")
  })
}

Response.prototype.json = function() {
  return this.text().then(JSON.parse)
}

Response.prototype.clone = function() {
  return new Response(this.response)
}

Response.prototype.toNode = function() {
  return this.response
}

Response.prototype.valueOf = Response.prototype.toNode

function desire(name) { return require.resolve(name) && require(name) }
