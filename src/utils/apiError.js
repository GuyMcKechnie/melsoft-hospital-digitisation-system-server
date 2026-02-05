class ApiError extends Error {
    constructor(message, status = 400, code = undefined, details = undefined) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

module.exports = ApiError;
