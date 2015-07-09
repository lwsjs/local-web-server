module.exports = [
    {
        name: "port", alias: "p", type: Number, defaultOption: true,
        description: "Web server port", group: "server"
    },
    {
        name: "log-format", alias: "f", type: String,
        description: "If a format is supplied an access log is written to stdout. If not, a statistics view is displayed. Use a preset ('none', 'dev','combined', 'short', 'tiny' or 'logstalgia') or supply a custom format (e.g. ':method -> :url').", group: "server"
    },
    {
        name: "directory", alias: "d", type: String,
        description: "Root directory, defaults to the current directory", group: "server"
    },
    {
        name: "compress", alias: "c", type: Boolean,
        description: "Enable gzip compression, reduces bandwidth.", group: "server"
    },
    {
        name: "refresh-rate", alias: "r", type: Number,
        description: "Statistics view refresh rate in ms. Defaults to 500.", group: "server"
    },
    {
        name: "help", alias: "h", type: Boolean,
        description: "Print these usage instructions", group: "misc"
    },
    {
        name: "config", type: Boolean,
        description: "Print the stored config", group: "misc"
    }
];
