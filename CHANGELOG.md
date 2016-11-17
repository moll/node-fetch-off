## Unreleased
- Adds a minimal Fetch API `Request` class.  
  Available from `require("fetch-off").Request`.

## 1.2.0 (Nov 17, 2016)
- Adds a non-standard `timeout` option for timing out the request if no initial response arrives in the given milliseconds.  
  Internally waits for Node's `response` event which fires once HTTP headers are received. Note that this is different from Node's `Socket.prototype.setTimeout`, which fires if the connection is idle.

## 1.1.0 (Nov 17, 2016)
- Adds `response.url`.

## 1.0.0 (Aug 29, 2016)
- Adds `fetch` function to combine `request` and `Response` instantiation.
- Makes said `fetch` function the default export.
- Renames to FetchOff.js.

## 0.2.0 (Jul 31, 2016)
- Makes `Response.prototype.arrayBuffer` standard-compliant by returning `ArrayBuffer`.

## 0.1.337 (Dec 18, 2015)
- Private release for profit and pleasure.
