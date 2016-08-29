FetchOff.js
===========
[![NPM version][npm-badge]](https://www.npmjs.com/package/fetch-off)

FetchOff.js is a **[Fetch API][fetch] polyfill and facade for Node.js**. That is, it allows you to use the Fetch interface you might be familiar with in the browser to make web requests from Node.js, getting back either a Fetch compatible `Response` object or Node.js's own `IncomingMessage` (like you would from vanilla `Http.get()`). In the latter respect it's a unique polyfill library — you have an option to use Fetch for requests, but still get the full streaming power of Node.js's responses.

FetchOff.js doesn't yet fully match the living Fetch API — it's missing redirect support for example — but for the common case it's sufficient.

[npm-badge]: https://img.shields.io/npm/v/fetch-off.svg
[fetch]: https://developer.mozilla.org/en/docs/Web/API/Fetch_API


Installing
----------
```sh
npm install fetch-off
```

FetchOff.js follows [semantic versioning](http://semver.org), so feel free to depend on its major version with something like `>= 1.0.0 < 2` (a.k.a `^1.0.0`).


Using
-----
### Fetch Compatible Request and Response

By default requiring FetchOff.js will give you a Fetch compatible function that takes `fetch`'s `url` and `options` arguments and resolves with an equally compatible Fetch's `Response`:

```javascript
var fetch = require("fetch-off")

var res = fetch("http://example.com")

res.then(function(res) {
  res.text().then(function(body) {
    console.log(res.status, body)
  })
})
```

As with the Fetch API, pass `method` to options to make POST requests:

```javascript
var res = fetch("http://example.com/messages", {
  method: "POST",
  headers: {"Content-Type": "application/json"},
  body: JSON.stringify({name: "John"})
})

res.then(function(res) {
  res.text().then(function(body) {
    console.log(res.status, body)
  })
})
```

If you'd like to automate serializing objects to JSON or HTML forms, please see:

- [FetchJsonify.js](https://github.com/moll/js-fetch-jsonify)
- [FetchFormify.js](https://github.com/moll/js-fetch-formify)

Those modules work perfectly with FetchOff.js's implementation.

### Fetch Compatible Request with Node's Response

Requiring FetchOff.js's `request` file will give you a Fetch API compatible request function that takes `fetch`'s `url` and `options` arguments. It resolves with the vanilla Node's response object (`IncomingMessage`) as you would get from `Http.get`:


```javascript
var request = require("fetch-off/request")

var res = request("http://example.com")

res.then(function(res) {
  console.log(res.statusCode, res.statusMessage)
  res.pipe(process.stdout)
})
```

In that way it's a very lightweight alternative to Mikael's [request](https://github.com/request/request) module.

### Fetch Compatible Response with Node's Request

If you have some code or middleware that works only with Fetch API `Response` objects, yet you make requests yourself, pass the Node.js's `IncomingMessage` object to FetchOff's `Response`:

```javascript
var Http = require("http")
var Response = require("fetch-off/response")

var res = new Response(Http.get("http://example.com"))

res.then(function(res) {
  res.text().then(function(body) {
    console.log(res.status, body)
  })
})
```


License
-------
FetchOff.js is released under a *Lesser GNU Affero General Public License*, which in summary means:

- You **can** use this program for **no cost**.
- You **can** use this program for **both personal and commercial reasons**.
- You **do not have to share your own program's code** which uses this program.
- You **have to share modifications** (e.g. bug-fixes) you've made to this program.

For more convoluted language, see the `LICENSE` file.


About
-----
**[Andri Möll][moll]** typed this and the code.  
[Monday Calendar][monday] supported the engineering work.

If you find FetchOff.js needs improving, please don't hesitate to type to me now at [andri@dot.ee][email] or [create an issue online][issues].

[email]: mailto:andri@dot.ee
[issues]: https://github.com/moll/js-fetch-off/issues
[moll]: http://themoll.com
[monday]: https://mondayapp.com
