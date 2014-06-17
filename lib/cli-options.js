module.exports = [
    {
        groups: "Server",
        options: [
            {
                name: "port", alias: "p", type: Number, defaultOption: true,
                description: "Web server port"
            },
            {
                name: "log-format", alias: "f", type: String,
                description: "If a format is supplied an access log is written to stdout. If not, \na statistics view is displayed. Use a preset ('none', 'dev',\n'default', 'short', 'tiny' or 'logstalgia') or supply a custom format\n(e.g. ':method -> :url')."
            },
            {
                name: "directory", alias: "d", type: String,
                description: "Root directory, defaults to the current directory"
            },
            {
                name: "compress", alias: "c", type: Boolean,
                description: "Enables compression"
            },
            {
                name: "refresh-rate", alias: "r", type: Number,
                description: "Statistics view refresh rate in ms. Defaults to 500."
            }
        ]
    },
    {
        groups: "Misc",
        options: [
            {
                name: "help", alias: "h", type: Boolean,
                description: "Print these usage instructions"
            },
            {
                name: "config", type: Boolean,
                description: "Print the stored config"
            }
        ]
    }
];
