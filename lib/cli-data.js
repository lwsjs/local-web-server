exports.optionDefinitions = [
  {
    name: 'port', alias: 'p', type: Number, defaultOption: true,
    description: 'Web server port.', group: 'server'
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
    name: 'help', alias: 'h', type: Boolean,
    description: 'Print these usage instructions.', group: 'misc'
  },
  {
    name: 'config', type: Boolean,
    description: 'Print the stored config.', group: 'misc'
  },
  {
    name: 'verbose', type: Boolean,
    description: 'Verbose output, useful for debugging.', group: 'misc'
  }
]

function usage (middlewareDefinitions) {
  return [
    {
      header: 'local-web-server',
      content: 'A simple web-server for productive front-end development.'
    },
    {
      header: 'Synopsis',
      content: [
        '$ ws [<server options>]',
        '$ ws --config',
        '$ ws --help'
      ]
    },
    {
      header: 'Server',
      optionList: exports.optionDefinitions,
      group: 'server'
    },
    {
      header: 'Middleware',
      optionList: middlewareDefinitions,
      group: 'middleware'
    },
    {
      header: 'Misc',
      optionList: exports.optionDefinitions,
      group: 'misc'
    },
    {
      content: 'Project home: [underline]{https://github.com/75lb/local-web-server}'
    }
  ]
}

exports.usage = usage
