var Mitm = require("mitm")
var Sinon = require("sinon")
var IncomingMessage = require("http").IncomingMessage
var request = require("../request")
var demand = require("must")

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

  describe("given timeout", function() {
    beforeEach(function() {
      this.time = Sinon.useFakeTimers("Date", "setTimeout", "clearTimeout")
    })
    afterEach(function() { this.time.restore() })

    it("must connect if quicker than given milliseconds", function*() {
      var res = request("http://example.com/models", {timeout: 10000})
      this.mitm.on("request", (req, res) => (this.time.tick(9999), res.end()))
      yield res.must.then.be.an.instanceof(IncomingMessage)
    })

    it("must connect if no timeout given", function*() {
      var res = request("http://example.com/models", {})
      this.mitm.on("request", (req, res) => (this.time.tick(999666), res.end()))
      yield res.must.then.be.an.instanceof(IncomingMessage)
    })

    it("must connect if timeout zero", function*() {
      var res = request("http://example.com/models", {timeout: 0})
      this.mitm.on("request", (req, res) => (this.time.tick(999666), res.end()))
      yield res.must.then.be.an.instanceof(IncomingMessage)
    })

    it("must not reject if time passes after request", function*() {
      var req = wait(this.mitm, "request")
      var res = request("http://example.com/models", {timeout: 10000})

      req = yield req
      req.res.writeHead(200)
      req.res.write("Hello")

      res = yield res
      res.must.be.an.instanceof(IncomingMessage)
      res.setEncoding("utf8")
      yield wait(res, "data").must.then.equal("Hello")

      this.time.tick(10000)

      // Using `demand` prevents slow serialization if abort is set.
      req.res.end("Bye")
      demand(res.req.aborted).be.undefined()
      yield wait(res, "data").must.then.equal("Bye")
    })

    it("must reject with Error if slower than given milliseconds", function*() {
      var res = request("http://example.com/models", {timeout: 10000})
      this.mitm.on("request", () => setImmediate(() => this.time.tick(12000)))

      var err
      try { yield res } catch (ex) { err = ex }
      err.must.be.an.error(Error, /timeout/i)
      err.code.must.equal("ETIMEDOUT")
    })
  })
})

function wait(obj, event) { return new Promise(obj.once.bind(obj, event)) }
