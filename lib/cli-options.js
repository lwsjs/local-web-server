exports.definitions = [
  {
    name: 'port', alias: 'p', type: Number, defaultOption: true,
    description: 'Web server port.', group: 'server'
  },
  {
    name: 'directory', alias: 'd', type: String, typeLabel: '[underline]{path}',
    description: 'Root directory, defaults to the current directory.', group: 'server'
  },
  {
    name: 'log-format', alias: 'f', type: String,
    description: "If a format is supplied an access log is written to stdout. If not, a dynamic statistics view is displayed. Use a preset ('none', 'dev','combined', 'short', 'tiny' or 'logstalgia') or supply a custom format (e.g. ':method -> :url').", group: 'server'
  },
  {
    name: 'rewrite', alias: 'r', type: String, multiple: true, typeLabel: '[underline]{expression} ...',
    description: "A list of URL rewrite rules. For each rule, separate the 'from' and 'to' routes with '->'. Whitespace surrounded the routes is ignored. E.g. '/from -> /to'.", group: 'server'
  },
  {
    name: 'spa', alias: 's', type: String, typeLabel: '[underline]{file}',
    description: 'Path to a Single Page App, e.g. app.html.', group: 'server'
  },
  {
    name: 'compress', alias: 'c', type: Boolean,
    description: 'Serve gzip-compressed resources, where applicable.', group: 'server'
  },
  {
    name: 'forbid', alias: 'b', type: String, multiple: true, typeLabel: '[underline]{path} ...',
    description: 'A list of forbidden routes.', group: 'server'
  },
  {
    name: 'no-cache', alias: 'n', type: Boolean,
    description: 'Disable etag-based caching - forces loading from disk each request.', group: 'server'
  },
  {
    name: 'key', type: String, typeLabel: '[underline]{file}', group: 'server',
    description: 'SSL key. Supply along with --cert to launch a https server.'
  },
  {
    name: 'cert', type: String, typeLabel: '[underline]{file}', group: 'server',
    description: 'SSL cert. Supply along with --key to launch a https server.'
  },
  {
    name: 'https', type: Boolean, group: 'server',
    description: 'Enable HTTPS using a built-in key and cert, registered to the domain 127.0.0.1.'
  },
  {
    name: 'verbose', type: Boolean,
    description: 'Verbose output, useful for debugging.', group: 'server'
  },
  {
    name: 'help', alias: 'h', type: Boolean,
    description: 'Print these usage instructions.', group: 'misc'
  },
  {
    name: 'config', type: Boolean,
    description: 'Print the stored config.', group: 'misc'
  }
]
exports.usageData = [
  {
    header: 'local-web-server',
    content: 'A simple web-server for productive front-end development.'
  },
  {
    header: 'Usage',
    content: [
      '$ ws [<server options>]',
      '$ ws --config',
      '$ ws --help'
    ]
  },
  {
    header: 'Server',
    optionList: exports.definitions,
    group: 'server'
  },
  {
    header: 'Misc',
    optionList: exports.definitions,
    group: 'misc'
  },
  {
    content: 'Project home: [underline]{https://github.com/lwsjs/local-web-server}'
  }
]
