var Headers = desire("node-fetch/lib/headers") || require("node-fetch").Headers
module.exports = Headers

function desire(name) { return require.resolve(name) && require(name) }
