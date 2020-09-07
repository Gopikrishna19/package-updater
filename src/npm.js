const os = require('os');

module.exports.getNpm = () => `npm${(/^win/.test(os.platform()) ? '.cmd' : '')}`;
