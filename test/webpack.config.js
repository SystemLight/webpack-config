const webpackConfig = require('../src');

module.exports = function (env, argv) {
    const config = webpackConfig(env, argv);
    return config.toConfig();
}
