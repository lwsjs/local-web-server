## mime-types
You can set additional mime-type/extension mappings, or override the defaults by setting a `mime` value in the stored config. This value is passed directly to [mime.define()](https://github.com/broofa/node-mime#mimedefine). Example:

```json
{
  "mime": {
    "text/plain": [ "php", "pl" ]
  }
}
```

[Example](https://github.com/lwsjs/local-web-server/tree/master/example/mime-override).
