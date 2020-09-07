const fs = require('fs');
const path = require('path');
const readline = require('readline');
const os = require('os');
const {spawn} = require('child_process');

const json = fs.createWriteStream(path.join(__dirname, 'status.json'), {
    flags: 'w',
});

const getNpm = () => `npm${(/^win/.test(os.platform()) ? '.cmd' : '')}`;

json.on('open', () => {
    const child = spawn(getNpm(), ['outdated', '--json'], {
        stdio: [
            'ignore',
            json,
            process.stderr,
        ],
    });

    child.on('error', (error) => {
        console.error(error);
        process.exit(1);
    });

    child.on('exit', () => json.close());
});

const recursiveReadLine = (rl, callback) => {
    rl.question('What do you want to do? [L/u/s]', (answer) => {
        console.log(answer);
        if (/^[lus]$/i.test(answer)) {
            return callback(answer.toLowerCase());
        } else if (answer.length === 0) {
            return callback('l');
        }

        recursiveReadLine(rl, callback);
    });
};

json.on('close', () => {
    const status = require('./status');
    const packages = Object.entries(status);

    if (!packages.length) {
        console.log('Nothing to update');
        return;
    }

    const install = [];

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    console.log('Use L, or just enter, to update the package to latest');
    console.log('Use U to update to wanted version, usually a minor update');
    console.log('Use S to skip updating the package');

    packages.forEach(([package, state], index) => {
        console.log(`Package: ${package}`);
        console.log(`Installed: ${state.current}\tNon breaking: ${state.wanted}\tLatest: ${state.latest}`);
        recursiveReadLine(rl, (answer) => {
            if (answer === 'l') {
                install.push(`${package}@latest`);
            } else if (answer === 'u') {
                install.push(`${package}@${state.wanted}`);
            }

            if (index === packages.length - 1) {
                rl.close();
            }
        });
    });

    rl.on('close', () => {
        const child = spawn(getNpm(), ['install'].concat(install), {
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
    });
});
