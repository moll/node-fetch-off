var Mitm = require("mitm")
var IncomingMessage = require("http").IncomingMessage
var request = require("../request")

describe("Request", function() {
  beforeEach(function() { this.mitm = Mitm() })
  afterEach(function() { this.mitm.disable() })

  it("must request given URL", function*() {
    request("http://example.com/models?deleted=true")
    var req = yield wait(this.mitm, "request")
    req.method.must.equal("GET")
    req.headers.host.must.equal("example.com")
    req.url.must.equal("/models?deleted=true")
  })

  it("must request given URL and method", function*() {
    request("http://example.com/models?deleted=true", {method: "head"})
    var req = yield wait(this.mitm, "request")
    req.method.must.equal("HEAD")
    req.headers.host.must.equal("example.com")
    req.url.must.equal("/models?deleted=true")
  })

  it("must not override path from options", function*() {
    request("http://example.com/models", {path: "/photographers"})
    var req = yield wait(this.mitm, "request")
    req.method.must.equal("GET")
    req.headers.host.must.equal("example.com")
    req.url.must.equal("/models")
  })

  it("must request given URL and body", function*() {
    request("http://example.com/models", {method: "post", body: "Hello"})

    var req = yield wait(this.mitm, "request")
    req.method.must.equal("POST")
    req.headers.host.must.equal("example.com")
    req.url.must.equal("/models")

    req.setEncoding("utf8")
    req.read().must.equal("Hello")
  })

  it("must resolve with IncomingMessage", function*() {
    this.mitm.on("request", function(req, res) {
      res.writeHead(200, {"Content-Type": "plain/text"})
      res.end("Hello")
    })

    var res = yield request("http://example.com/models")
    res.must.be.an.instanceof(IncomingMessage)
    res.setEncoding("utf8")
    res.read().must.equal("Hello")
  })
})

function wait(obj, event) {
  return new Promise(obj.once.bind(obj, event))
}
