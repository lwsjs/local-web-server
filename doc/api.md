<a name="module_local-web-server"></a>

## local-web-server
**Emits**: <code>module:local-web-server#event:verbose</code>  
**Example**  
```js
const LocalWebServer = require('local-web-server')
const localWebServer = new LocalWebServer()
const server = localWebServer.listen({
  port: 8050,
  https: true,
  directory: 'src',
  spa: 'index.html',
  websocket: 'src/websocket-server.js'
})
// secure, SPA server with listening websocket now ready on port 8050
```

* [local-web-server](#module_local-web-server)
    * [LocalWebServer](#exp_module_local-web-server--LocalWebServer) ⏏
        * [.listen([options])](#module_local-web-server--LocalWebServer+listen) ⇒ <code>Server</code>

<a name="exp_module_local-web-server--LocalWebServer"></a>

### LocalWebServer ⏏
**Kind**: Exported class  
<a name="module_local-web-server--LocalWebServer+listen"></a>

#### localWebServer.listen([options]) ⇒ <code>Server</code>
Returns a listening HTTP/HTTPS server.

**Kind**: instance method of [<code>LocalWebServer</code>](#exp_module_local-web-server--LocalWebServer)  
**Params**

- [options] <code>object</code> - Server options
    - [.port] <code>number</code> - Port
    - [.hostname] <code>string</code> - The hostname (or IP address) to listen on. Defaults to 0.0.0.0.
    - [.maxConnections] <code>number</code> - The maximum number of concurrent connections supported by the server.
    - [.keepAliveTimeout] <code>number</code> - The period (in milliseconds) of inactivity a connection will remain open before being destroyed. Set to `0` to keep connections open indefinitely.
    - [.configFile] <code>string</code> - Config file path, defaults to 'lws.config.js'.
    - [.https] <code>boolean</code> - Enable HTTPS using a built-in key and cert registered to the domain 127.0.0.1.
    - [.key] <code>string</code> - SSL key file path. Supply along with --cert to launch a https server.
    - [.cert] <code>string</code> - SSL cert file path. Supply along with --key to launch a https server.
    - [.pfx] <code>string</code> - Path to an PFX or PKCS12 encoded private key and certificate chain. An alternative to providing --key and --cert.
    - [.ciphers] <code>string</code> - Optional cipher suite specification, replacing the default.
    - [.secureProtocol] <code>string</code> - Optional SSL method to use, default is "SSLv23_method".
    - [.stack] <code>Array.&lt;string&gt;</code> | <code>Array.&lt;Middlewares&gt;</code> - Array of feature classes, or filenames of modules exporting a feature class.
    - [.server] <code>string</code> | <code>ServerFactory</code> - Custom server factory, e.g. lws-http2.
    - [.websocket] <code>string</code> | <code>Websocket</code> - Path to a websocket module
    - [.moduleDir] <code>Array.&lt;string&gt;</code> - One or more directories to search for modules.

