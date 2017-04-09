var Url = require("url")
var Http = require("http")
var Https = require("https")
var assign = require("oolong").assign
module.exports = request

function request(url, opts) {
  url = Url.parse(url)
  var Web = url.protocol === "https:" ? Https : Http

  var req = Web.request(assign({}, opts, url))
  if (opts && "body" in opts) write(req, opts.body)
  if (opts && "timeout" in opts && opts.timeout > 0) timeout(req, opts.timeout)
  req.end()

  return new Promise(resolve.bind(null, req))
}

function resolve(req, resolve, reject) {
  req.once("response", resolve)
  req.once("timeout", reject)
  req.once("error", reject)
}

function write(req, body) {
  var type = typeOf(body)

  switch (type) {
    case "string":
    case "buffer": req.write(body); break
    case "null": break
    case "undefined": break
    default: throw new TypeError("Invalid body type: " + type)
  }
}

function timeout(req, timeout) {
  // Start counting timeout from the moment a connection can be made.
  // When using an overloaded HTTP Agent, an actual connection might be delayed.
  req.on("socket", function() {
    var id = setTimeout(timeoutAbort, timeout, req)
    req.on("error", clearTimeout.bind(null, id))
    req.on("response", clearTimeout.bind(null, id))
  })
}

function timeoutAbort(req) {
  req.abort(req)
  var err = new Error("Fetch Timeout")
  err.code = "ETIMEDOUT"
  req.emit("timeout", err)
}

function typeOf(value) {
  if (value === null) return "null"
  if (value instanceof Buffer) return "buffer"
  return typeof value
}
