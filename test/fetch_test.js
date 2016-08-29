var Mitm = require("mitm")
var fetch = require("../fetch")

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
})

function wait(obj, event) {
  return new Promise(obj.once.bind(obj, event))
}
