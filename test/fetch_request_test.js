var Mitm = require("mitm")
var Request = require("../fetch_request")
var Sinon = require("sinon")
var URL = "http://example.com"

describe("Request", function() {
  beforeEach(function() { this.mitm = Mitm() })
  afterEach(function() { this.mitm.disable() })

  beforeEach(function() {
    this.mitm.length = 0
    this.mitm.on("request", function(req) { this[this.length++] = req })
  })

  describe("new", function() {
    it("must not make network requests", function() {
      new Request(URL)
      this.mitm.length.must.equal(0)
    })
  })

  describe("url", function() {
    it("must be the full URL", function() {
      var req = new Request("http://example.com/models?deleted=true")
      req.url.must.equal("http://example.com/models?deleted=true")
    })
  })

  describe("method", function() {
    it("must be the method", function() {
      var req = new Request(URL, {method: "POST"})
      req.method.must.equal("POST")
    })

    it("must be the method in uppercase", function() {
      var req = new Request(URL, {method: "post"})
      req.method.must.equal("POST")
    })

    it("must be GET if not given in options", function() {
      var req = new Request(URL)
      req.method.must.equal("GET")
    })

    it("must be GET if no options given", function() {
      var req = new Request(URL)
      req.method.must.equal("GET")
    })
  })

  describe("headers", function() {
    it("must be set", function() {
      var req = new Request(URL, {
        headers: {
          "Content-Type": "plain/text",
          "X-Answer": "42"
        }
      })

      req.headers.get("content-type").must.equal("plain/text")
      req.headers.get("x-answer").must.equal("42")
    })
  })

  describe(".prototype.then", function() {
    beforeEach(function() {
      this.time = Sinon.useFakeTimers("setTimeout", "clearTimeout")
    })
    afterEach(function() { this.time.restore() })

    it("must use given resolve function", function*() {
      this.mitm.on("request", (req, res) => res.end())
      var req = new Request(URL)
      yield req.then(() => "Caught").must.then.equal("Caught")
    })

    it("must use given reject function", function*() {
      this.mitm.on("request", () => setImmediate(() => this.time.tick(12000)))
      var req = new Request(URL, {timeout: 10000})
      yield req.then(null, () => "Caught").must.then.equal("Caught")
    })
  })
})
