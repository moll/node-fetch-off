var Response = require("./response")
var request = require("./request")
exports = module.exports = fetch
exports.Headers = require("./headers")
exports.Response = require("./response")

function fetch(url, opts) {
	return request(url, opts).then(function(res) { return new Response(res) })
}
