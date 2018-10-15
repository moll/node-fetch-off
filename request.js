var Url = require("url")
var Http = require("http")
var Https = require("https")
var assign = require("oolong").assign
module.exports = request

function request(url, opts) {
  url = Url.parse(url)
  var Web = url.protocol === "https:" ? Https : Http

  var req = Web.request(assign({}, opts, url))
  if (opts && "timeout" in opts && opts.timeout > 0) timeout(req, opts.timeout)
  end(req, opts ? opts.body : null)

  return new Promise(resolve.bind(null, req))
}

function resolve(req, resolve, reject) {
  req.once("response", resolve)
  req.once("timeout", reject)
  req.once("error", reject)
}

function end(req, body) {
  // As of Oct 15, 2018, Node.js still only sets Content-Length if you give
  // the body to OutoingMessage.prototype.end:
  // https://github.com/nodejs/node/blob/v6.x/lib/_http_outgoing.js#L547
  if (body === null || body === undefined) req.end()
  else if (typeof body == "string" || body instanceof Buffer) req.end(body)
  else throw new TypeError("Invalid body: " + body)
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
