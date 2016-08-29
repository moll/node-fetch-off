var Headers = require("./headers")
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
  // Error has to be returned in a promise.
  if (this.bodyUsed) return Promise.reject(new TypeError(BODY_USED_ERR))
  this.bodyUsed = true

  var res = this.response
  var chunks = []

  return new Promise(function(resolve, reject) {
    res.on("data", function(chunk) { chunks.push(chunk) })
    res.on("end", function(chunk) { resolve(bufferize(chunks)) })
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
  return this.arrayBuffer().then(Buffer).then(utf8ize)
}

Response.prototype.json = function() {
  return this.arrayBuffer().then(Buffer).then(JSON.parse)
}

Response.prototype.clone = function() {
  return new Response(this.response)
}

Response.prototype.toNode = function() {
  return this.response
}

Response.prototype.valueOf = Response.prototype.toNode

function bufferize(buffers) {
  var length = buffers.map(function(buf) { return buf.length }).reduce(add, 0)
  var array = new Uint8Array(length)

  for (var i = 0, offset = 0; i < buffers.length; ++i) {
    var buffer = buffers[i]
    array.set(buffer, offset)
    offset += buffer.length
  }

  return array.buffer
}

function add(a, b) { return a + b }
function utf8ize(buffer) { return buffer.toString("utf8") }
