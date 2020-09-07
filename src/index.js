const {askForUpdate} = require('./ask-for-update');
const {generatePackageStatus} = require('./check-for-updates');
const {performUpdates} = require('./perform-update');

generatePackageStatus()
    .then(askForUpdate)
    .then(performUpdates);
