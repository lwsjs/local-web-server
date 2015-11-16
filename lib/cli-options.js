module.exports = {
  definitions: [
    {
      name: 'port', alias: 'p', type: Number, defaultOption: true,
      description: 'Web server port', group: 'server'
    },
    {
      name: 'log-format', alias: 'f', type: String,
      description: "If a format is supplied an access log is written to stdout. If not, a dynamic statistics view is displayed. Use a preset ('none', 'dev','combined', 'short', 'tiny' or 'logstalgia') or supply a custom format (e.g. ':method -> :url').", group: 'server'
    },
    {
      name: 'directory', alias: 'd', type: String,
      description: 'Root directory, defaults to the current directory', group: 'server'
    },
    {
      name: 'compress', alias: 'c', type: Boolean,
      description: 'Enable gzip compression, reduces bandwidth.', group: 'server'
    },
    {
      name: 'forbid', alias: 'b', type: String, multiple: true, typeLabel: '[underline]{regexp} ...',
      description: 'A list of forbidden routes', group: 'server'
    },
    {
      name: 'no-cache', alias: 'n', type: Boolean,
      description: 'Disable etag-based caching - forces loading from disk each request.', group: 'server'
    },
    {
      name: 'rewrite', alias: 'r', type: String, multiple: true, typeLabel: '[underline]{expression} ...',
      description: 'A list of URL rewrite rules', group: 'server'
    },
    {
      name: 'help', alias: 'h', type: Boolean,
      description: 'Print these usage instructions', group: 'misc'
    },
    {
      name: 'config', type: Boolean,
      description: 'Print the config found in [underline]{package.json} and/or [underline]{.local-web-server}', group: 'misc'
    }
  ],
  usageData: {
    title: 'local-web-server',
    description: 'A simple web-server for productive front-end development.',
    footer: 'Project home: [underline]{https://github.com/75lb/local-web-server}',
    synopsis: [
      '$ ws [server options]',
      '$ ws --config',
      '$ ws --help'
    ],
    groups: {
      server: 'Server',
      misc: 'Misc'
    }
  }
}
