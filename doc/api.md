## API Reference


* [local-web-server](#module_local-web-server)
    * [LocalWebServer](#exp_module_local-web-server--LocalWebServer) ⇐ <code>module:middleware-stack</code> ⏏
        * [new LocalWebServer([options])](#new_module_local-web-server--LocalWebServer_new)
        * _instance_
            * [.view](#module_local-web-server--LocalWebServer.LocalWebServer+view) : <code>View</code>
            * [.features](#module_local-web-server--LocalWebServer.LocalWebServer+features) : <code>Array.&lt;Feature&gt;</code>
            * [.options](#module_local-web-server--LocalWebServer.LocalWebServer+options) : <code>object</code>
            * [.server](#module_local-web-server--LocalWebServer+server) : <code>Server</code>
            * [.getApplication()](#module_local-web-server--LocalWebServer+getApplication) ⇒ <code>function</code>
            * [.getServer()](#module_local-web-server--LocalWebServer+getServer) ⇒ <code>Server</code>
        * _inner_
            * [~loadStack()](#module_local-web-server--LocalWebServer..loadStack) ⇒ <code>object</code>

<a name="exp_module_local-web-server--LocalWebServer"></a>

### LocalWebServer ⇐ <code>module:middleware-stack</code> ⏏
**Kind**: Exported class  
**Extends:** <code>module:middleware-stack</code>  
<a name="new_module_local-web-server--LocalWebServer_new"></a>

#### new LocalWebServer([options])
**Params**

- [options] <code>object</code> - Server options
    - .port} <code>number</code> - Port
    - .stack} <code>Array.&lt;string&gt;</code> | <code>Array.&lt;Features&gt;</code> - Port

<a name="module_local-web-server--LocalWebServer.LocalWebServer+view"></a>

#### localWebServer.view : <code>View</code>
Current view.

**Kind**: instance property of <code>[LocalWebServer](#exp_module_local-web-server--LocalWebServer)</code>  
<a name="module_local-web-server--LocalWebServer.LocalWebServer+features"></a>

#### localWebServer.features : <code>Array.&lt;Feature&gt;</code>
Loaded feature modules

**Kind**: instance property of <code>[LocalWebServer](#exp_module_local-web-server--LocalWebServer)</code>  
<a name="module_local-web-server--LocalWebServer.LocalWebServer+options"></a>

#### localWebServer.options : <code>object</code>
Config

**Kind**: instance property of <code>[LocalWebServer](#exp_module_local-web-server--LocalWebServer)</code>  
<a name="module_local-web-server--LocalWebServer+server"></a>

#### localWebServer.server : <code>Server</code>
Node.js server

**Kind**: instance property of <code>[LocalWebServer](#exp_module_local-web-server--LocalWebServer)</code>  
<a name="module_local-web-server--LocalWebServer+getApplication"></a>

#### localWebServer.getApplication() ⇒ <code>function</code>
Returns a middleware application suitable for passing to `http.createServer`. The application is a function with three args (req, res and next) which can be created by express, Koa or hand-rolled.

**Kind**: instance method of <code>[LocalWebServer](#exp_module_local-web-server--LocalWebServer)</code>  
<a name="module_local-web-server--LocalWebServer+getServer"></a>

#### localWebServer.getServer() ⇒ <code>Server</code>
Returns a listening server which processes requests using the middleware supplied.

**Kind**: instance method of <code>[LocalWebServer](#exp_module_local-web-server--LocalWebServer)</code>  
<a name="module_local-web-server--LocalWebServer..loadStack"></a>

#### LocalWebServer~loadStack() ⇒ <code>object</code>
Loads a module by either path or name.

**Kind**: inner method of <code>[LocalWebServer](#exp_module_local-web-server--LocalWebServer)</code>  
