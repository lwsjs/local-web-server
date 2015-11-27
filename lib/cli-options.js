module.exports = {
  definitions: [
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
  ],
  usageData: {
    title: 'local-web-server',
    description: 'A simple web-server for productive front-end development.',
    footer: 'Project home: [underline]{https://github.com/75lb/local-web-server}',
    synopsis: [
      '$ ws [<server options>]',
      '$ ws --config',
      '$ ws --help'
    ],
    groups: {
      server: 'Server',
      misc: 'Misc'
    }
  }
}
