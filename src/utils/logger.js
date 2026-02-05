const morgan = require('morgan');

function requestLogger() {
    return morgan('combined');
}

const logger = {
    info: (...args) => console.info(...args),
    warn: (...args) => console.warn(...args),
    error: (...args) => console.error(...args),
};

module.exports = { requestLogger, logger };
