var request = require("./request")
var Response = require("./response")

module.exports = function fetch(url, opts) {
	return request(url, opts).then(function(res) { return new Response(res) })
}
