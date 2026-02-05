const ResponseHelper = require('../utils/response');
const ApiError = require('../utils/apiError');

function errorHandler(err, req, res, next) {
    if (res.headersSent) return next(err);

    if (err instanceof ApiError) {
        return ResponseHelper.error(res, { code: err.code, message: err.message, details: err.details }, err.status);
    }

    // Joi validation error handling
    if (err && err.isJoi) {
        return ResponseHelper.error(res, { code: 'validation_error', message: 'Validation failed', details: err.details }, 422);
    }

    // Default: internal server error
    console.error(err);
    return ResponseHelper.error(res, { code: 'internal_error', message: 'Internal Server Error' }, 500);
}

module.exports = errorHandler;
