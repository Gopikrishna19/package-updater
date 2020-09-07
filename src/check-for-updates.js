const fs = require('fs');
const {getNpm} = require('./npm');
const path = require('path');
const {spawn} = require('child_process');

module.exports.generatePackageStatus = () => new Promise((resolve, reject) => {
    const json = fs.createWriteStream(path.join(__dirname, 'status.json'), {
        flags: 'w',
    });

    json.on('open', () => {
        const child = spawn(getNpm(), ['outdated', '--json'], {
            stdio: [
                'ignore',
                json,
                process.stderr,
            ],
        });

        child.on('error', (error) => {
            reject(error);
        });

        child.on('exit', () => json.close());
    });

    json.on('close', () => resolve());
});
