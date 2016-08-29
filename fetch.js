var Response = require("./response")
var request = require("./request")

module.exports = function fetch(url, opts) {
	return request(url, opts).then(function(res) { return new Response(res) })
}
