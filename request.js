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
  req.end()

  return new Promise(resolve.bind(null, req))
}

function resolve(req, resolve, reject) {
  req.once("response", resolve)
  req.once("error", reject)
}

function write(req, body) {
  var type = typeOf(body)

  switch (type) {
    case "string": req.write(body); break
    case "null": break
    case "undefined": break
    default: throw new TypeError("Invalid body type: " + type)
  }
}

function typeOf(value) {
  if (value === null) return "null"
  return typeof value
}
