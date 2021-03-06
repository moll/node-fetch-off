var Mitm = require("mitm")
var Headers = require("../headers");
var Request = require("../fetch_request");
var Response = require("../response");
var fetch = require("..")

describe("fetch", function() {
  beforeEach(function() { this.mitm = Mitm() })
  afterEach(function() { this.mitm.disable() })

  it("must request given URL", function*() {
    fetch("http://example.com/models?deleted=true")
    var req = yield wait(this.mitm, "request")
    req.method.must.equal("GET")
    req.headers.host.must.equal("example.com")
    req.url.must.equal("/models?deleted=true")
  })

	it("must return response", function*() {
    this.mitm.on("request", function(req, res) {
      res.writeHead(203, "Simon Said")
      res.end()
    })

		var res = yield fetch("http://example.com/models?deleted=true")
		res.type.must.equal("basic")
    res.status.must.equal(203)
    res.statusText.must.equal("Simon Said")
	})

	describe(".Headers", function() {
		it("must equal Reponse", function() {
			fetch.Headers.must.equal(Headers)
		})
	})

	describe(".Request", function() {
		it("must equal Reponse", function() {
			fetch.Request.must.equal(Request)
		})
	})

	describe(".Response", function() {
		it("must equal Reponse", function() {
			fetch.Response.must.equal(Response)
		})
	})
})

function wait(obj, event) {
  return new Promise(obj.once.bind(obj, event))
}
