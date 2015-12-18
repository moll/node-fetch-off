var O = require("oolong")
var Url = require("url")
var Http = require("http")
var Mitm = require("mitm")
var Response = require("../response")
var URL = "http://example.com"

describe("Response", function() {
  beforeEach(function() { this.mitm = Mitm() })
  afterEach(function() { this.mitm.disable() })

  it("must set status code and message", function*() {
    this.mitm.on("request", function(req, res) {
      res.writeHead(203, "Simon Said")
      res.end()
    })

    var res = new Response(yield request(URL))
    res.status.must.equal(203)
    res.statusText.must.equal("Simon Said")
  })

  it("must set ok if status code >= 200", function*() {
    this.mitm.on("request", function(req, res) {
      res.writeHead(200)
      res.end()
    })

    new Response(yield request(URL)).ok.must.be.true()
  })

  it("must set ok if status code >= 200", function*() {
    this.mitm.on("request", function(req, res) {
      res.writeHead(200)
      res.end()
    })

    new Response(yield request(URL)).ok.must.be.true()
  })

  it("must not set body used", function*() {
    this.mitm.on("request", function(req, res) { res.end() })
    var res = new Response(yield request(URL))
    res.bodyUsed.must.be.false()
  })

  describe("headers", function() {
    it("must be set from IncomingMessage", function*() {
      this.mitm.on("request", function(req, res) {
        res.writeHead(200, {
          "Content-Type": "plain/text",
          "X-Answer": "42"
        })

        res.end()
      })

      var res = new Response(yield request(URL))
      res.headers.get("content-type").must.equal("plain/text")
      res.headers.get("x-answer").must.equal("42")
    })
  })

  describe(".prototype.arrayBuffer", function() {
    it("must return body as buffer", function*() {
      this.mitm.on("request", function(req, res) {
        res.writeHead(200, {"Content-Type": "application/octet-stream"})
        res.end("\x13\x37")
      })

      var res = new Response(yield request(URL))
      var body = yield res.arrayBuffer()
      body.must.be.an.instanceof(Buffer)
      Buffer.compare(body, new Buffer("\x13\x37")).must.equal(0)
    })

    it("must reject when requested twice", function*() {
      this.mitm.on("request", function(req, res) {
        res.writeHead(200, {"Content-Type": "application/octet-stream"})
        res.end("\x13\x37")
      })

      var res = new Response(yield request(URL))
      yield res.arrayBuffer()
      yield res.arrayBuffer().must.reject.with.error(TypeError, /body/i)
    })

    it("must reject when requested twice from another Response", function*() {
      this.mitm.on("request", function(req, res) {
        res.writeHead(200, {"Content-Type": "application/octet-stream"})
        res.end("\x13\x37")
      })

      var res = yield request(URL)
      yield new Response(res).arrayBuffer()
      var body = new Response(res).arrayBuffer()
      body.must.reject.with.error(TypeError, /body/i)
    })
  })

  describe(".prototype.blob", function() {
    it("must throw a not implemented error", function*() {
      this.mitm.on("request", function(req, res) { res.end() })
      var res = new Response(yield request(URL))
      var err
      try { res.blob() } catch (ex) { err = ex }
      err.must.be.an.error(Error, /not implemented/i)
    })
  })

  describe(".prototype.formData", function() {
    it("must throw a not implemented error", function*() {
      this.mitm.on("request", function(req, res) { res.end() })
      var res = new Response(yield request(URL))
      var err
      try { res.formData() } catch (ex) { err = ex }
      err.must.be.an.error(Error, /not implemented/i)
    })
  })

  describe(".prototype.text", function() {
    it("must return body as UTF-8 text", function*() {
      this.mitm.on("request", function(req, res) {
        res.writeHead(200, {"Content-Type": "plain/text"})
        res.end("Hello • Wörld")
      })

      var res = new Response(yield request(URL))
      yield res.text().must.then.equal("Hello • Wörld")
    })
  })

  describe(".prototype.json", function() {
    it("must return body as parsed JSON", function*() {
      this.mitm.on("request", function(req, res) {
        res.writeHead(200, {"Content-Type": "plain/text"})
        res.end(JSON.stringify({key: "value"}))
      })

      var res = new Response(yield request(URL))
      yield res.json().must.then.eql({key: "value"})
    })
  })

  describe(".prototype.toNode", function() {
    it("must return the IncomingMessage", function*() {
      this.mitm.on("request", function(req, res) { res.end() })
      var msg = yield request(URL)
      var res = new Response(msg)
      res.toNode().must.equal(msg)
    })
  })

  describe(".prototype.valueOf", function() {
    it("must be an alias of toNode", function() {
      Response.prototype.valueOf.must.equal(Response.prototype.toNode)
    })
  })
})

function request(url, opts) {
  var req = Http.request(O.assign(Url.parse(url), opts))
  req.end()
  return new Promise(resolve.bind(null, req))
}

function resolve(req, resolve, reject) {
  req.once("response", resolve)
  req.once("error", reject)
}
