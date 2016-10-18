## HTTPS Server

Some modern techs (ServiceWorker, any `MediaDevices.getUserMedia()` request etc.) *must* be served from a secure origin (HTTPS). To launch an HTTPS server, supply a `--key` and `--cert` to local-web-server, for example:

```
$ ws --key localhost.key --cert localhost.crt
```

If you don't have a key and certificate it's trivial to create them. You do not need third-party verification (Verisign etc.) for development purposes. To get the green padlock in the browser, the certificate..

* must have a `Common Name` value matching the FQDN of the server
* must be verified by a Certificate Authority (but we can overrule this - see below)

First create a certificate:

1. Install openssl.

  `$ brew install openssl`

2. Generate a RSA private key.

  `$ openssl genrsa -des3 -passout pass:x -out ws.pass.key 2048`

3. Create RSA key.

  ```
  $ openssl rsa -passin pass:x -in ws.pass.key -out ws.key
  ```

4. Create certificate request. The command below will ask a series of questions about the certificate owner. The most imporant answer to give is for `Common Name`, you can accept the default values for the others.  **Important**: you **must** input your server's correct FQDN (`dev-server.local`, `laptop.home` etc.) into the `Common Name` field. The cert is only valid for the domain specified here. You can find out your computers host name by running the command `hostname`. For example, mine is `mba3.home`.

  `$ openssl req -new -key ws.key -out ws.csr`

5. Generate self-signed certificate.

  `$ openssl x509 -req -days 365 -in ws.csr -signkey ws.key -out ws.crt`

6. Clean up files we're finished with

  `$ rm ws.pass.key ws.csr`

7. Launch HTTPS server. In iTerm, control-click the first URL (with the hostname matching `Common Name`) to launch your browser.

  ```
  $ ws --key ws.key --cert ws.crt
  serving at https://mba3.home:8010, https://127.0.0.1:8010, https://192.168.1.203:8010
  ```

Chrome and Firefox will still complain your certificate has not been verified by a Certificate Authority. Firefox will offer you an `Add an exception` option, allowing you to ignore the warning and manually mark the certificate as trusted. In Chrome on Mac, you can manually trust the certificate another way:

1. Open Keychain
2. Click File -> Import. Select the `.crt` file you created.
3. In the `Certificates` category, double-click the cert you imported.
4. In the `trust` section, underneath `when using this certificate`, select `Always Trust`.

Now you have a valid, trusted certificate for development.

### Built-in certificate
As a quick win, you can run `ws` with the `https` flag. This will launch an HTTPS server using a [built-in certificate](https://github.com/75lb/local-web-server/tree/master/ssl) registered to the domain 127.0.0.1.
