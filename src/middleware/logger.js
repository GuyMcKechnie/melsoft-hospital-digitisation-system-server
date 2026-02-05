const winston = require('winston');

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.json(),
    transports: [new winston.transports.Console({ format: winston.format.simple() })]
});

function requestLogger(req, res, next) {
    logger.info(`${req.method} ${req.originalUrl}`);
    next();
}

module.exports = { logger, requestLogger };
