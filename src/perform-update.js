const {getNpm} = require('./npm');
const {spawn} = require('child_process');

module.exports.performUpdates = (updates) => {
    const installs = updates.map(({name, version}) => `${name}@${version}`).join(' ');

    const child = spawn(getNpm(), ['install'].concat(installs), {
        shell: true,
        stdio: [
            'ignore',
            process.stdout,
            process.stderr,
        ],
    });

    child.on('error', (error) => {
        console.error(error);
        process.exit(1);
    });
};
