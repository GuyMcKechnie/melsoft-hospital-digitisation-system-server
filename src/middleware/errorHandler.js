function formatError(err) {
    if (!err) return { code: 'unknown_error', message: 'An error occurred' };
    return {
        code: err.code || 'server_error',
        message: err.message || 'Internal Server Error',
        details: err.details || undefined
    };
}

module.exports = function errorHandler(err, req, res, next) {
    const payload = formatError(err);
    const status = err.status || 500;
    res.status(status).json({ success: false, error: payload });
};
