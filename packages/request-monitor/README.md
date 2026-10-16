[![view on npm](https://img.shields.io/npm/v/lws-request-monitor.svg)](https://www.npmjs.org/package/lws-request-monitor)
[![npm module downloads](https://img.shields.io/npm/dt/lws-request-monitor.svg)](https://www.npmjs.org/package/lws-request-monitor)
[![Build Status](https://travis-ci.org/lwsjs/request-monitor.svg?branch=master)](https://travis-ci.org/lwsjs/request-monitor)
[![Dependency Status](https://badgen.net/david/dep/lwsjs/request-monitor)](https://david-dm.org/lwsjs/request-monitor)

# lws-request-monitor

Adds request and response logging to [lws](https://github.com/lwsjs/lws) verbose output.

Example command:

```
$ lws --stack request-monitor static index --verbose
```

Example verbose output:


```js
{
  'server.request': {
    requestId: 1,
    method: 'GET',
    url: '/package-lock',
    headers: {
      host: '192.168.0.200:8000',
      'user-agent': 'curl/7.65.0',
      accept: '*/*'
    }
  }
}
{
  'server.response': {
    requestId: 1,
    statusCode: 200,
    headers: [Object: null prototype] {
      'content-length': '27212',
      'last-modified': 'Wed, 05 Jun 2019 11:59:01 GMT',
      'cache-control': 'max-age=0',
      'content-type': 'application/json; charset=utf-8'
    },
    body: [ ReadStream: /Users/lloyd/Documents/lwsjs/examples/static-index/package-lock.json ]
  }
}
```

* * *

&copy; 2017-26 Lloyd Brookes \<opensource@75lb.com\>.
