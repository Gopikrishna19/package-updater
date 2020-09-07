const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const askQuestion = (name, {current, wanted, latest}) => new Promise(resolve => {
    console.log('');
    console.log(`Package: ${name}`);
    console.log(`Installed:                     ${current || 'Not Installed'}`);
    console.log(`Version to install per semver: ${wanted}`);
    console.log(`Latest available:              ${latest}`);

    rl.question('Do you want to update? [L/u/s]', (answer) => {
        if (/^[lus]$/i.test(answer)) {
            resolve(answer.toLowerCase());
        } else if (answer.length === 0) {
            resolve('l');
        } else {
            resolve('s');
        }
    });
});

const askQuestions = (packages) => {
    let chain = Promise.resolve([]);

    packages.forEach(p => {
        chain = chain
            .then(answers => askQuestion(...p).then(answer => answers.concat(answer)));
    });

    return chain
        .then((answers) => {
            rl.close();
            return answers;
        });
};

const getUpdates = packages => (answers) => packages
    .map(([name, {wanted}], i) => {
        const answer = answers[i];
        const update = {
            name,
        };

        if (answer === 'l') {
            update.version = 'latest';
        } else if (answer === 'u') {
            update.version = wanted;
        }

        return update;
    })
    .filter((update) => update.version);

module.exports.askForUpdate = () => {
    const status = require(path.join(__dirname, 'status.json'));
    const packages = Object.entries(status);

    if (!packages.length) {
        console.log('Nothing to update.');
        return;
    }

    console.log('Use L, or just enter, to update the package to latest.');
    console.log('Use U to update to wanted version, usually a minor update.');
    console.log('Use S to skip updating the package.');
    console.log('Anything else will just skip updating that package.');

    return askQuestions(packages)
        .then(getUpdates(packages));
};
